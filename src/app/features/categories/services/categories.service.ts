import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Category, CategoryResponse } from '../models/category.model';
import { TableColumnConfig } from '../../../shared/models/table.model';
import { ToastService } from '../../../core/services/toast/toast.service';

/**
 * Enterprise Categories State Management Layer
 * -----------------------------------------------------------------------------------
 * Orchestrates taxonomy domain states.
 * * * Note on Mutation Strategy:
 * As the backend provides read-only access for certain entities, this service 
 * implements an "Optimistic UI" pattern where mutations (Add/Update/Delete) are 
 * managed within the local client state. This ensures a seamless UX despite
 * the absence of corresponding server-side persistence endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private http = inject(HttpClient);
  private endPoints = 'products'; 
  private toastService = inject(ToastService);
  
  // --- Core State Signals ---
  /** Writable signal tracking the master list of taxonomy categories */
  private categoriesState = signal<readonly Category[]>([]);
  
  /** Signal defining the structural presentation mode (Table vs Card view) */
  viewMode = signal<'table' | 'cards'>('table');
  
  /** Signal tracking the active filter predicate for searching categories */
  searchQuery = signal<string>('');

  // --- Computed Derived Interfaces ---
  
  /** Reactive selector filtering category list based on search predicate */
  categories = computed<readonly Category[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const currentState = this.categoriesState();
    
    if (!query) return currentState;
    
    return currentState.filter(cat => 
      cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query)
    );
  });

  /** Configuration map for generic table columns */
  tableColumnsConfig = computed<TableColumnConfig[]>(() => {
    return [
      { key: 'name', label: 'TABLE.HEADERS.NAME', type: 'text' },
      { key: 'slug', label: 'TABLE.HEADERS.SLUG', type: 'text' },
      { key: 'edit', label: 'TABLE.HEADERS.EDIT', type: 'actions' },
      { key: 'delete', label: 'TABLE.HEADERS.DELETE', type: 'actions' }
    ];
  });

  /**
   * Safe Hydration Pipeline - Parallel Product Image Injection Flow
   * ---------------------------------------------------------------------------------
   * 1. Fetches all category taxonomies from the core API.
   * 2. Uses forkJoin for parallel request execution to resolve category thumbnails.
   * 3. Implements fallback logic to ensure visual consistency in the absence of explicit metadata.
   */
  loadCategories(): Observable<readonly Category[]> {
    return this.http.get<CategoryResponse[]>(`${this.endPoints}/categories`).pipe(
      switchMap((rawCategories) => {
        if (!rawCategories || rawCategories.length === 0) return of([]);

        // Create parallel execution stream to resolve product-based imagery per category
        const requests = rawCategories.map(cat => 
          this.http.get<{ products: any[] }>(`${this.endPoints}/category/${cat.slug}`).pipe(
            map(res => ({
              slug: cat.slug,
              name: cat.name,
              url: cat.url,
              thumbnail: res.products?.[0]?.thumbnail || `https://picsum.photos/seed/${cat.slug}/400/300`
            }))
          )
        );

        // Execute parallel resolution for performance optimization
        return forkJoin(requests);
      }),
      tap(hydratedCategories => this.categoriesState.set(hydratedCategories))
    );
  }

  /** Updates the local search query signal */
  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  /** Updates the active view presentation mode */
  toggleViewMode(mode: 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }

  /**
   * Immutable State Mutation (Add Category)
   * Client-side simulation of record creation for prototyping purposes.
   */
  addCategory(categoryData: Record<string, any>): Observable<Category> {
    const generatedSlug = categoryData['slug']?.toLowerCase().trim().replace(/ /g, '-') || 
                          categoryData['name']?.toLowerCase().trim().replace(/ /g, '-') || 
                          'new-category';

    const newCat: Category = {
      slug: generatedSlug,
      name: categoryData['name'],
      url: categoryData['url'] || '',
      thumbnail: `https://picsum.photos/seed/${generatedSlug}/400/300`
    };

    // Update state immutably using the functional update pattern
    this.categoriesState.update(curr => [newCat, ...curr]);
    this.toastService.success('Category created successfully!');
    return of(newCat); 
  }

  /** Lookup category entity by slug identifier */
  getCategoryBySlug(slug: string | null): Category | undefined {
    if (!slug) return undefined;
    return this.categoriesState().find(cat => cat.slug === slug);
  }

  /**
   * Immutable State Mutation (Update Category)
   * Localized state synchronization logic.
   */
  updateCategory(oldSlug: string, updatedData: Record<string, any>): Observable<Category> {
    let updatedCat: Category | undefined;

    this.categoriesState.update(curr => 
      curr.map(cat => {
        if (cat.slug === oldSlug) {
          updatedCat = {
            ...cat,
            name: updatedData['name'],
            url: updatedData['url'] || cat.url,
            slug: updatedData['slug']?.toLowerCase().trim().replace(/ /g, '-') || cat.slug
          };
          return updatedCat;
        }
        return cat;
      })
    );

    this.toastService.success('Category updated successfully!');
    return of(updatedCat || (updatedData as Category));
  }

  /** Guard to determine if the local state has been initialized */
  isStateEmpty(): boolean {
    return this.categoriesState().length === 0;
  }

  /**
   * Immutable State Mutation (Delete Category)
   * Localized record purging from the master state signal.
   */
  deleteCategory(slug: string): void {
    this.categoriesState.update(curr => curr.filter(c => c.slug !== slug));
    this.toastService.success('Category deleted successfully!');
  }
}