import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Product, ProductResponse } from '../models/product';
import { Observable, of, tap } from 'rxjs';
import { DropdownItem } from '../../../shared/models/dropdown.model';
import { TableColumnConfig } from '../../../shared/models/table.model';

/**
 * Enterprise Product Service Layer
 * -----------------------------------------------------------------------------------
 * Centralized domain state manager for product assets. Implements the Repository 
 * Pattern to orchestrate normalized entity caching, reactive state synchronization,
 * and declarative data fetching pipelines.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);
  private endPoints = 'products';

  // --- State Signals (Encapsulated Writable State) ---
  /** Master list of product records for list views */
  private productsState = signal<Product[]>([]);
  /** Normalized entity cache for O(1) retrieval efficiency */
  private productEntities = signal<Record<number, Product>>({});
  /** Taxonomy registry for filtering operations */
  private categoriesState = signal<string[]>([]);

  // --- UI State Management (Projection Signals) ---
  viewMode = signal<'table' | 'cards'>('table');
  totalItems = signal<number>(0);
  limitState = signal<number>(10);
  currentPage = signal<number>(1);
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');

  /** Derived pagination offset calculated from page index and slice limit */
  skipState = computed(() => (this.currentPage() - 1) * this.limitState());
  
  /** Public interface for the active dataset projection */
  products = computed(() => this.productsState());

  /** * Taxonomy projection: 
   * Transforms raw API categories into dropdown-compliant UI configuration objects. 
   */
  categories = computed<DropdownItem[]>(() => {
    const allOption: DropdownItem = { label: 'All Categories', value: 'All Categories' };
    const apiOptions = this.categoriesState().map(cat => ({ label: this.capitalize(cat), value: cat }));
    return [allOption, ...apiOptions];
  });

  /** Retrieve product instance by ID from the normalized entity cache */
  getProductById(id: string | null): Product | undefined {
    if (!id) return undefined;
    return this.productEntities()[+id];
  }

  /**
   * Catalog Hydration Pipeline:
   * Evaluates current filter predicates and executes remote fetching operations.
   */
  loadProducts(): Observable<ProductResponse> {
    let apiEndPoint = this.endPoints;
    if (this.selectedCategory() && this.selectedCategory() !== 'All Categories') {
      apiEndPoint = `${this.endPoints}/category/${this.selectedCategory().toLowerCase()}`;
    } else if (this.searchQuery()) {
      apiEndPoint = `${this.endPoints}/search`;
    }

    const queryParams = `?limit=${this.limitState()}&skip=${this.skipState()}` + (this.searchQuery() ? `&q=${this.searchQuery()}` : '');

    return this.http.get<ProductResponse>(`${apiEndPoint}${queryParams}`).pipe(
      tap(res => {
        this.productsState.set(res.products);
        // Entity Normalization: Map collection into indexed records
        const entityMap: Record<number, Product> = {};
        res.products.forEach(p => entityMap[p.id] = p);
        this.productEntities.update(current => ({ ...current, ...entityMap }));
        this.totalItems.set(res.total);
      })
    );
  }

  /**
   * Atomic Asset Fetcher:
   * Checks entity cache before falling back to remote API execution.
   */
  loadSingleProduct(id: string): Observable<Product> {
    const numericId = +id;
    const cachedProduct = this.productEntities()[numericId];

    if (cachedProduct) return of(cachedProduct);

    return this.http.get<Product>(`${this.endPoints}/${id}`).pipe(
      tap(product => {
        this.productEntities.update(state => ({ ...state, [product.id]: product }));
      })
    );
  }

  /** Fetches available product taxonomies from the remote service */
  loadCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.endPoints}/category-list`).pipe(
      tap(res => this.categoriesState.set(res))
    );
  }

  /** * Persistence Pipeline (Add):
   * Performs optimistic state update to reflect remote changes locally.
   */
  addProduct(productData: Record<string, any>): Observable<Product> {
    return this.http.post<Product>(`${this.endPoints}/add`, productData).pipe(
      tap(newProduct => {
        this.productsState.update(curr => [newProduct, ...curr]);
        this.productEntities.update(curr => ({ ...curr, [newProduct.id]: newProduct }));
        this.totalItems.update(t => t + 1);
      })
    );
  }

  /** Persistence Pipeline (Update) */
  updateProduct(id: number, productData: Record<string, any>): Observable<Product> {
    return this.http.put<Product>(`${this.endPoints}/${id}`, productData).pipe(
      tap(updated => {
        this.productsState.update(curr => curr.map(p => p.id === id ? { ...p, ...updated } : p));
        this.productEntities.update(curr => ({ ...curr, [id]: { ...curr[id], ...updated } }));
      })
    );
  }

  /** Persistence Pipeline (Delete) */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.endPoints}/${id}`).pipe(
      tap(() => {
        this.productsState.update(curr => curr.filter(p => p.id !== id));
        this.productEntities.update(curr => {
          const updated = { ...curr };
          delete updated[id];
          return updated;
        });
        this.totalItems.update(total => Math.max(0, total - 1));
      })
    );
  }

  /** Syncs filter states and resets pagination to baseline */
  updateFilters(search: string, category: string): void {
    this.searchQuery.set(search);
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.loadProducts().subscribe();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts().subscribe();
  }

  toggleViewMode(mode: 'table' | 'cards'): void { this.viewMode.set(mode); }
  
  private capitalize(str: string): string { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

  /**
   * Dynamic Table Schema Registry:
   * Maps domain model properties to UI column specifications.
   */
  tableColumnsConfig = computed<TableColumnConfig[]>(() => {
    const current = this.productsState();
    if (!current.length) return [];
    const keys = ['title', 'category', 'price', 'stock', 'edit', 'delete'];
    return keys.map(key => ({
      key,
      label: `TABLE.HEADERS.${key.toUpperCase()}`,
      type: (key === 'price' || key === 'stock') ? 'badge' : (key === 'edit' || key === 'delete') ? 'actions' : 'text'
    }));
  });
}