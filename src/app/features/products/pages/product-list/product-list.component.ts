import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductFilterBarComponent } from '../../components/product-filter-bar/product-filter-bar.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { GenericTableComponent } from '../../../../shared/components/table/generic-table.component/generic-table.component';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product';
import { GenericCardComponent } from '../../../../shared/components/generic-card/generic-card.component';
import { TableColumnConfig } from '../../../../shared/models/table.model';

/**
 * Enterprise Product Management Orchestrator Component
 * -----------------------------------------------------------------------------------
 * Acts as the dedicated Smart Container coordinating the master product inventory view.
 * Integrates router state memory hydration to support intuitive and clean lookups
 * without sacrificing presentation layout state synchronization.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductFilterBarComponent,
    ProductCardComponent,
    PaginationComponent,
    GenericTableComponent,
    GenericCardComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {

  /** Injected reactive store manager tracking localized catalog states */
  protected productsService = inject(ProductsService);

  /** Router navigation engine for programmatic viewport transitions */
  private router = inject(Router);

  /** Router state reader capturing global context matrix parameters from the URL */
  private route = inject(ActivatedRoute);

  /** Execution anchor for clean RxJS stream lifecycle disposal */
  private destroyRef = inject(DestroyRef);

  /** Structural matrix properties mapping UI headers to i18n keys */
  protected readonly tableConfig: TableColumnConfig[] = [
    { key: 'title', label: 'TABLE.HEADERS.TITLE' },
    { key: 'category', label: 'TABLE.HEADERS.CATEGORY' },
    { key: 'price', label: 'TABLE.HEADERS.PRICE', isCurrency: true },
    { key: 'stock', label: 'TABLE.HEADERS.STOCK' }
  ];

  /**
   * Lifecycle hook: Orchestrates state initialization from router background contexts
   * and triggers the initial data hydration pipelines.
   */
  ngOnInit(): void {
    this.initializeFiltersFromRoute();
    this.loadCatalogData();
  }

  /**
   * Hidden State Memory Sync:
   * Extracts background state attributes injected through previous router transitions.
   * This approach maintains a clean URL footprint while preserving cross-navigation context.
   */
  private initializeFiltersFromRoute(): void {
    const navigation = this.router.getCurrentNavigation();
    // Prioritize current navigation extras, fallback to history state for direct reloads/restorations
    const stateTarget = navigation?.extras.state?.['targetCategory'] || history.state?.['targetCategory'];
    
    if (stateTarget) {
      this.productsService.selectedCategory.set(stateTarget);
    } else {
      this.productsService.selectedCategory.set('All Categories');
    }
  }

  /**
   * Data Pipeline Activation:
   * Executes cold observable streams to hydrate the product catalog and taxonomy registry.
   */
  private loadCatalogData(): void {
    this.productsService.loadProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.productsService.loadCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Filter Mutation Pipeline:
   * Synchronizes the internal domain state for real-time reactive updates.
   * Keeps URL presentation perfectly clean without query parameter strings.
   * @param filters Complex layout boundaries capturing query values
   */
  protected onFilterChange(filters: { search: string; category: string }): void {
    this.productsService.updateFilters(filters.search, filters.category);
  }

  protected onViewModeChange(mode: 'table' | 'cards'): void {
    this.productsService.toggleViewMode(mode);
  }

  protected onAddNewProduct(): void {
    this.router.navigate(['/products/create']);
  }

  protected onViewProductDetails(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  /**
   * Context-Driven Operation Router Gate:
   * Intercepts mutation requests and branches logic based on operational intent.
   */
  protected onProductAction(action: 'edit' | 'delete', product: Product): void {
    if (action === 'edit') {
      this.router.navigate(['/products/edit', product.id]);
    } else if (action === 'delete') {
      const isConfirmed = confirm('Are you sure you want to delete this product?');
      if (isConfirmed) {
        this.productsService.deleteProduct(product.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    }
  }
}