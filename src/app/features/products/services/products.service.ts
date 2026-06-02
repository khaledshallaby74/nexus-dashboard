import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Product, ProductResponse } from '../models/product';
import { Observable, tap } from 'rxjs';
import { DropdownItem } from '../../../shared/models/dropdown.model';
import { TableColumnConfig } from '../../../shared/models/table.model';

/**
 * Enterprise Product Service Layer
 * -----------------------------------------------------------------------------------
 * Manages the domain state for products, including normalized entity mapping,
 * reactive filtering, and CRUD operation pipelines.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);
  private endPoints = 'products';

  // --- State Signals ---
  
  /** Primary stream of the current paginated product list */
  private productsState = signal<Product[]>([]);
  
  /** * Normalized entity cache (Map-like structure).
   * Enables O(1) time complexity for record retrieval by primary key.
   */
  private productEntities = signal<Record<number, Product>>({});
  
  /** Taxonomy registry for filtering context */
  private categoriesState = signal<string[]>([]);

  // --- UI State Management ---
  
  /** Layout projection mode toggle */
  viewMode = signal<'table' | 'cards'>('table');
  
  /** Total record count for pagination boundary calculations */
  totalItems = signal<number>(0);
  
  /** Records per slice constraint */
  limitState = signal<number>(10);
  
  /** Current pagination page index cursor */
  currentPage = signal<number>(1);
  
  /** Current text search predicate */
  searchQuery = signal<string>('');
  
  /** Currently selected taxonomy filter */
  selectedCategory = signal<string>('');

  /** Derived pagination offset calculated from page index and slice limit */
  skipState = computed(() => (this.currentPage() - 1) * this.limitState());
  
  /** Public interface for the active dataset */
  products = computed(() => this.productsState());

  /** * Transforms raw categories into dropdown-compliant objects.
   * Prepends a global 'All' selection for filter resetting.
   */
  categories = computed<DropdownItem[]>(() => {
    const allOption: DropdownItem = { label: 'All Categories', value: 'All Categories' };
    const apiOptions = this.categoriesState().map(cat => ({ label: this.capitalize(cat), value: cat }));
    return [allOption, ...apiOptions];
  });

  /** Retrieves a specific entity from the local normalized cache using O(1) lookup */
  getProductById(id: string | null): Product | undefined {
    if (!id) return undefined;
    return this.productEntities()[+id];
  }

  /** Synchronizes product stream based on active filter and pagination states */
  loadProducts(): void {
    let apiEndPoint = this.endPoints;
    if (this.selectedCategory() && this.selectedCategory() !== 'All Categories') {
      apiEndPoint = `${this.endPoints}/category/${this.selectedCategory().toLowerCase()}`;
    } else if (this.searchQuery()) {
      apiEndPoint = `${this.endPoints}/search`;
    }

    const queryParams = `?limit=${this.limitState()}&skip=${this.skipState()}` + (this.searchQuery() ? `&q=${this.searchQuery()}` : '');

    this.http.get<ProductResponse>(`${apiEndPoint}${queryParams}`).pipe(
      tap(res => {
        this.productsState.set(res.products);
        const entityMap: Record<number, Product> = {};
        res.products.forEach(p => entityMap[p.id] = p);
        // Sync local cache with remote result set
        this.productEntities.update(current => ({ ...current, ...entityMap }));
        this.totalItems.set(res.total);
      })
    ).subscribe();
  }

  /** Lazy-loads a single entity from remote if not cached locally */
  loadSingleProduct(id: string): void {
    const numericId = +id;
    if (this.productEntities()[numericId]) return;

    this.http.get<Product>(`${this.endPoints}/${id}`).pipe(
      tap(product => {
        this.productEntities.update(state => ({ ...state, [product.id]: product }));
      })
    ).subscribe();
  }

  /** Fetches remote taxonomy registry for UI hydration */
  loadCategories(): void {
    this.http.get<string[]>(`${this.endPoints}/category-list`).pipe(
      tap(res => this.categoriesState.set(res))
    ).subscribe();
  }

  /** Performs optimistic creation of new products */
  addProduct(productData: Record<string, any>): Observable<Product> {
    return this.http.post<Product>(`${this.endPoints}/add`, productData).pipe(
      tap(newProduct => {
        this.productsState.update(curr => [newProduct, ...curr]);
        this.productEntities.update(curr => ({ ...curr, [newProduct.id]: newProduct }));
        this.totalItems.update(t => t + 1);
      })
    );
  }

  /** Updates existing entity with delta changes and synchronizes state */
  updateProduct(id: number, productData: Record<string, any>): Observable<Product> {
    return this.http.put<Product>(`${this.endPoints}/${id}`, productData).pipe(
      tap(updated => {
        this.productsState.update(curr => curr.map(p => p.id === id ? { ...p, ...updated } : p));
        this.productEntities.update(curr => ({ ...curr, [id]: { ...curr[id], ...updated } }));
      })
    );
  }

  /** Deletes an entity and purges it from normalized state caches */
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

  /** Resets page index and triggers new fetch cycle on filter mutation */
  updateFilters(search: string, category: string): void {
    this.searchQuery.set(search);
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  toggleViewMode(mode: 'table' | 'cards') { this.viewMode.set(mode); }
  
  private capitalize(str: string): string { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

  /**
   * Computed column definition factory.
   * Maps domain entity keys to translatable UI headers.
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