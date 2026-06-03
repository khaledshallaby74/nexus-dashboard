import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';

/**
 * Enterprise Application Route Registry
 * -----------------------------------------------------------------------------------
 * Orchestrates the application's navigation structure. Implements lazy-loading 
 * for feature modules to optimize initial bundle size and performance.
 */
export const routes: Routes = [
  {   
    path: '', 
    component: AdminLayoutComponent,
    children: [
      /** * Product Management Inventory View 
       * Primary list interface for asset oversight.
       */
      {
        path: 'products',
        loadComponent: () => 
          import('./features/products/pages/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
        title: 'NEXUS - Products Management'
      },
      
      /** * Resource Creation Channel 
       * Navigates to the smart form context for new asset declarations.
       */
      {
        path: 'products/create',
        loadComponent: () => 
          import('./features/products/pages/product-form-context/product-form-context.component').then(
            (m) => m.ProductFormContextComponent
          ),
        title: 'NEXUS - Create Product'
      },

      /** * Asset Update Pipeline 
       * Dynamic routing for modifying existing records via entity ID injection.
       */
      {
        path: 'products/edit/:id',
        loadComponent: () => 
          import('./features/products/pages/product-form-context/product-form-context.component').then(
            (m) => m.ProductFormContextComponent
          ),
        title: 'NEXUS - Edit Product'
      },
      /** * Taxonomy Management Inventory View 
       * Primary list interface for global category and filtering context oversight.
       */
      {
        path: 'categories',
        loadComponent: () => 
          import('./features/categories/pages/category-list/category-list.component').then(
            (m) => m.CategoryListComponent
          ),
        title: 'NEXUS - Categories Management'
      },

      /** * Taxonomy Resource Creation Channel 
       * Navigates to the smart form context for new category declarations.
       */
      {
        path: 'categories/create',
        loadComponent: () => 
          import('./features/categories/pages/category-form-context/category-form-context.component').then(
            (m) => m.CategoryFormContextComponent
          ),
        title: 'NEXUS - Create Category'
      },

      /** * Taxonomy Asset Update Pipeline 
       * Dynamic routing for modifying existing categories via context slug injection.
       */
      {
        path: 'categories/edit/:slug',
        loadComponent: () => 
          import('./features/categories/pages/category-form-context/category-form-context.component').then(
            (m) => m.CategoryFormContextComponent
          ),
        title: 'NEXUS - Edit Category'
      }
    ]
  }
];