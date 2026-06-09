import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Order, OrdersAPIResponse } from '../models/order.model';
import { DropdownItem } from '../../../shared/models/dropdown.model';

/**
 * Enterprise Financial Orders Service Layer
 * -----------------------------------------------------------------------------------
 * Centralized domain state manager for financial transactions and order ledgers.
 * Implements client-side reactive predicates to complement remote API limitations.
 * * * Core Features:
 * - State Projection: Derives financial metrics (Gross/Net Revenue) reactively.
 * - Entity Hydration: Normalizes raw API data with business-logic status injection.
 * - Reactive Filtering: Orchestrates searching and filtering via Signal-based computation.
 */
@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'carts';

  // --- State Signals (Encapsulated Writable State) ---
  private ordersState = signal<Order[]>([]);
  private totalOrdersCountState = signal<number>(0);
  private isLoadingState = signal<boolean>(false);

  // --- UI State Management (Projection Signals) ---
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('All Orders');

  // --- Public Read-Only Interface Streams ---
  readonly isLoading = this.isLoadingState.asReadonly();
  readonly totalOrdersCount = this.totalOrdersCountState.asReadonly();

  /** * Active Dataset Projection:
   * Programmatically applies multi-conditional search and status predicates
   * to the master order collection.
   */
  readonly orders = computed<Order[]>(() => {
    let list: Order[] = this.ordersState();

    // 1. Search Predicate Evaluation (Order ID || Customer ID)
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase().trim();
      list = list.filter((order: Order) => 
        String(order.id).includes(query) || 
        String(order.userId).includes(query)
      );
    }

    // 2. Accounting Status Predicate Evaluation
    if (this.selectedStatus() && this.selectedStatus() !== 'All Orders') {
      list = list.filter((order: Order) => {
        const currentStatus = order.status?.toLowerCase();
        if (this.selectedStatus() === 'Pending Check') return currentStatus === 'pending';
        if (this.selectedStatus() === 'Shipped Out') return currentStatus === 'shipped';
        if (this.selectedStatus() === 'Delivered') return currentStatus === 'delivered';
        return true;
      });
    }

    return list;
  });

  /** Taxonomy projection for dropdown UI binding (Source of Truth) */
  readonly statusesDropdown = computed<DropdownItem[]>(() => [
    { label: 'ORDERS.FILTERS.ALL', value: 'All Orders' },
    { label: 'ORDERS.FILTERS.PENDING', value: 'Pending Check' },
    { label: 'ORDERS.FILTERS.SHIPPED', value: 'Shipped Out' },
    { label: 'ORDERS.FILTERS.DELIVERED', value: 'Delivered' }
  ]);

  // --- Business & Financial Intelligence Ledger (Derived Signals) ---
  
  /** Sum of all line totals before discounts */
  readonly grossRevenue = computed<number>(() => 
    this.orders().reduce((sum: number, order: Order) => sum + order.total, 0)
  );
  
  /** Grand total of the order after all discounts applied */
  readonly netRevenue = computed<number>(() => 
    this.orders().reduce((sum: number, order: Order) => sum + order.discountedTotal, 0)
  );
  
  /** Cumulative count of all items across processed orders */
  readonly totalItemsProcessed = computed<number>(() => 
    this.orders().reduce((sum: number, order: Order) => sum + order.totalQuantity, 0)
  );

  /**
   * Catalog Hydration Pipeline:
   * Fetches order records and maps randomized statuses to provide 
   * a rich structural demonstration of order lifecycle states.
   */
  getOrders(limit: number = 10, skip: number = 0): Observable<Order[]> {
    this.isLoadingState.set(true);
    return this.http.get<OrdersAPIResponse>(`${this.apiUrl}?limit=${limit}&skip=${skip}`).pipe(
      tap((response: OrdersAPIResponse) => {
        this.totalOrdersCountState.set(response.total);
        this.isLoadingState.set(false);
      }),
      map((response: OrdersAPIResponse) => {
        const statuses: ('pending' | 'shipped' | 'delivered')[] = ['pending', 'shipped', 'delivered'];
        return response.carts.map((order: any, index: number) => ({
          ...order,
          status: statuses[index % statuses.length]
        })) as Order[];
      }),
      tap((mappedOrders: Order[]) => this.ordersState.set(mappedOrders))
    );
  }

  /** Relational Filter Pipeline: Retrieves elements bound to specific User entities */
  getOrdersByUser(userId: number): Observable<Order[]> {
    this.isLoadingState.set(true);
    return this.http.get<{ carts: Order[] }>(`${this.apiUrl}/user/${userId}`).pipe(
      map((response: { carts: Order[] }) => response.carts),
      tap((orders: Order[]) => {
        this.ordersState.set(orders);
        this.totalOrdersCountState.set(orders.length);
        this.isLoadingState.set(false);
      })
    );
  }

  /** Syncs operational matrix predicates from UI view changes */
  updateFilters(search: string, status: string): void {
    this.searchQuery.set(search);
    this.selectedStatus.set(status);
  }
}