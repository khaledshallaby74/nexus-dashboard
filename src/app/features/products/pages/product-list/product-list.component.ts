import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { ProductFilterBarComponent } from '../../components/product-filter-bar/product-filter-bar.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { GenericTableComponent } from '../../../../shared/components/table/generic-table.component/generic-table.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product';
import { GenericCardComponent } from '../../../../shared/components/generic-card/generic-card.component';
import { TableColumnConfig } from '../../../../shared/models/table.model';

/**
 * Enterprise Product Management Orchestrator Component
 * -----------------------------------------------------------------------------------
 * Acts as the dedicated Smart Container coordinating the master product inventory view.
 * Handles primary data stream hydration, execution routing for mutations, view mode toggles,
 * and declarative programmatic router dispatches based on active context targets.
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
    SpinnerComponent 
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  /** Injected reactive store manager tracking localized catalog states and server mutations */
  protected productsService = inject(ProductsService);
  
  /** Framework routing engine utilized to dispatch explicit programmatic view layout traversals */
  private router = inject(Router);

  /** Structural matrix properties map configuring cell layout headers and i18n localization keys */
  protected tableConfig: TableColumnConfig[] = [
    { key: 'title', label: 'TABLE.HEADERS.TITLE' },
    { key: 'category', label: 'TABLE.HEADERS.CATEGORY' },
    { key: 'price', label: 'TABLE.HEADERS.PRICE', isCurrency: true },
    { key: 'stock', label: 'TABLE.HEADERS.STOCK' }
  ];

  /**
   * Synchronous lifecycle hook executing immediate catalog lookups and asset hydrations.
   */
  ngOnInit(): void {
    this.productsService.loadProducts();
    this.productsService.loadCategories();
  }

  /**
   * Intercepts search filtering updates and updates lookup parameters on the state tier.
   * @param filters Complex layout boundaries capturing query values and criteria nodes
   */
  protected onFilterChange(filters: { search: string; category: string }): void {
    this.productsService.updateFilters(filters.search, filters.category);
  }

  /**
   * Dispatches configuration swaps altering structural presentations between tables and grids.
   * @param mode Target structural representation signature layout
   */
  protected onViewModeChange(mode: 'table' | 'cards'): void {
    this.productsService.toggleViewMode(mode);
  }

  /**
   * Direct Programmatic Router Navigation: Resource Creation Channel
   * ---------------------------------------------------------------------------------
   * Reroutes viewports cleanly to dedicated isolated layout views for asset declarations.
   */
  protected onAddNewProduct(): void {
    this.router.navigate(['/products/create']);
  }

  /**
   * Evaluates record row selections to route towards specific entity documentation deep links.
   * @param product Target specialized model instance node context reference
   */
  protected onViewProductDetails(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  /**
   * Context-Driven Operation Router Gate
   * ---------------------------------------------------------------------------------
   * Intercepts downstream abstract event emissions, extracts target primary keys, 
   * and branches execution flows into either structural deletion pipelines or deep-link update layouts.
   * * @param action Intent token mapping the nature of requested mutation
   * @param product Bound target entity context providing unique identifier states
   */
  protected onProductAction(action: 'edit' | 'delete', product: Product): void {
    if (action === 'edit') {
      // Transition viewport state into dedicated inline asset rehydration context matrices
      this.router.navigate(['/products/edit', product.id]);
    } else if (action === 'delete') {
      console.log('Trigger Delete Flow for ID:', product.id);    }
  }
}