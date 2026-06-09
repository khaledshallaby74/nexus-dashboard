import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';
import { TableColumnConfig } from '../../../../shared/models/table.model';

import { OrderFilterBarComponent } from '../../components/order-filter-bar/order-filter-bar.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { GenericTableComponent } from '../../../../shared/components/table/generic-table.component/generic-table.component';
import { GenericCardComponent } from '../../../../shared/components/generic-card/generic-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { OrderCardComponent } from '../../components/orders-card/order-card.component';

/**
 * Enterprise Financial Orders Orchestrator Component
 * -----------------------------------------------------------------------------------
 * Smart Container managing the orders ledger state. Handles data hydration,
 * pagination orchestration, and synchronized view toggles. Implements context-aware
 * routing for user-specific order discovery.
 */
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    OrderFilterBarComponent,
    OrderCardComponent,
    PaginationComponent,
    GenericTableComponent,
    GenericCardComponent,
    TranslateModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {
  
  /** Reactive Accounting/Logistics Store API */
  protected ordersService = inject(OrdersService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Core Presentation View States
  protected viewMode = signal<'table' | 'cards'>('table');
  protected currentPage = 1;
  protected pageSize = 12;

  /** Native Data Grid Structural Headers Alignment */
  protected readonly gridConfig: TableColumnConfig[] = [
    { key: 'id', label: 'ORDERS.TABLE.ID', type: 'text' },
    { key: 'userId', label: 'ORDERS.TABLE.CUSTOMER_ID', type: 'text' },
    { key: 'totalProducts', label: 'ORDERS.TABLE.ITEMS_COUNT', type: 'text' },
    { key: 'total', label: 'ORDERS.TABLE.GROSS_TOTAL', type: 'badge' },
    { key: 'discountedTotal', label: 'ORDERS.TABLE.NET_TOTAL', type: 'badge' },
    { key: 'status', label: 'ORDERS.TABLE.STATUS', type: 'badge' }
  ];

  ngOnInit(): void {
    this.hydrateOrdersPipeline();
  }

  /**
   * Orchestrates the order retrieval pipeline.
   * Prioritizes contextual user-specific lookups before falling back to global pagination.
   */
  private hydrateOrdersPipeline(): void {
    const navigation = this.router.getCurrentNavigation();
    const targetedUserId = navigation?.extras.state?.['userId'] || history.state?.['userId'];

    if (targetedUserId) {
      this.ordersService.getOrdersByUser(targetedUserId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    } else {
      this.loadPaginatedOrders();
    }
  }

  /** Executes paginated fetch against the logistics service */
  private loadPaginatedOrders(): void {
    const skip = (this.currentPage - 1) * this.pageSize;
    this.ordersService.getOrders(this.pageSize, skip)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /** Updates layout representation (Table vs Cards) */
  protected onViewModeChange(mode: 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }

  /** Pagination Event Handler: Triggers data reload on page change */
  protected onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPaginatedOrders();
  }

  /** Routing Gateway: Transition to dedicated order detail viewport */
  protected onViewOrderDetails(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  /**
   * Filter Orchestration:
   * Updates domain state based on filter bar emissions.
   */
  protected onFilterChange(filters: { search: string; status: string }): void {
    this.ordersService.updateFilters(filters.search, filters.status);
  }
}