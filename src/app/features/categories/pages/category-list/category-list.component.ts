import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.model';
import { CategoryFilterBarComponent } from '../../components/category-filter-bar/category-filter-bar.component';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { GenericTableComponent } from '../../../../shared/components/table/generic-table.component/generic-table.component';
import { GenericCardComponent } from '../../../../shared/components/generic-card/generic-card.component';
import { TableColumnConfig } from '../../../../shared/models/table.model';

/** Strictly typed contract representing actions emitted by standard asset grids or tables */
interface TableActionEvent {
  action: 'edit' | 'delete';
  row: Category;
}

/**
 * Enterprise Category Management Orchestrator Component
 * -----------------------------------------------------------------------------------
 * Acts as the dedicated Smart Container coordinating the master taxonomy view.
 * Handles cold data stream activation, view mode toggles, and reactive mutations.
 */
@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    CategoryFilterBarComponent,
    CategoryCardComponent,
    GenericTableComponent,
    GenericCardComponent
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListComponent implements OnInit {
  
  /** Injected reactive store manager tracking taxonomy states and offline actions */
  protected categoriesService = inject(CategoriesService);
  
  /** Framework routing engine utilized to dispatch explicit programmatic layout navigations */
  private router = inject(Router);
  
  /** Technical token utilized as the execution anchor for clean RxJS stream disposals */
  private destroyRef = inject(DestroyRef);

  /** Static layout blueprint ensuring generic table column definitions are available instantly */
  protected readonly tableConfig: TableColumnConfig[] = [
    { key: 'name', label: 'TABLE.HEADERS.NAME', type: 'text' },
    { key: 'slug', label: 'TABLE.HEADERS.SLUG', type: 'text' },
    { key: 'edit', label: 'TABLE.HEADERS.EDIT', type: 'actions' },
    { key: 'delete', label: 'TABLE.HEADERS.DELETE', type: 'actions' }
  ];

  /**
   * Synchronous lifecycle hook activating cold taxonomy HTTP lookup streams.
   * Secured with strict destruction bounds to prevent long-running execution leaks.
   */
  ngOnInit(): void {
    this.categoriesService.loadCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Navigation Gateway: Redirects to the product inventory filtered by the selected category.
   * Uses Router State to pass the category slug for cross-module context preservation.
   * @param category The source taxonomy entity clicked by the user
   */
  protected onCategoryClick(category: Category): void {
    this.router.navigate(['/products'], {
      state: { targetCategory: category.slug }
    });
  }

  /**
   * Intercepts search filtering updates and flushes query tokens down to the state engine.
   * @param query Pure unformatted search predicate text string
   */
  protected onSearchChange(query: string): void {
    this.categoriesService.updateSearchQuery(query);
  }

  /**
   * Dispatches configuration swaps altering structural presentations between tables and grids.
   * @param mode Target structural representation signature layout
   */
  protected onViewModeChange(mode: 'table' | 'cards'): void {
    this.categoriesService.toggleViewMode(mode);
  }

  /**
   * Direct Programmatic Router Navigation: Resource Creation Channel
   */
  protected onAddNewCategory(): void {
    this.router.navigate(['/categories/create']);
  }

  /**
   * Context-Driven Operation Router Gate
   * ---------------------------------------------------------------------------------
   * Intercepts downstream abstract event emissions, performs type narrowing, 
   * and branches execution flows into either optimistic deletion or update layouts.
   * @param event Encapsulated payload capturing the mutation intent and context target
   */
  protected onCategoryAction(event: unknown): void {
    const { action, row } = event as TableActionEvent;

    if (action === 'edit') {
      this.router.navigate(['/categories/edit', row.slug]);
    } else if (action === 'delete') {
      /** Native confirmation gate to prevent accidental record permanent erasure */
      const isConfirmed = confirm(`Are you sure you want to delete "${row.name}"?`);
      
      if (isConfirmed) {
        // Pure Optimistic update handled via local service-level state signal mutation
        this.categoriesService.deleteCategory(row.slug);
      }
    }
  }
}