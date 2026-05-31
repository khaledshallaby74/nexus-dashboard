import { ChangeDetectionStrategy, Component, input, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { DropdownItem } from '../../../../shared/models/dropdown.model';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component'; 
import { ViewSwitcherComponent } from '../../../../shared/components/view-switcher/view-switcher.component'; 

/**
 * ProductFilterBarComponent
 * --------------------------------------------------------------------------------------
 * Acts as a highly flexible, declarative mediator bar for product and entities list layouts.
 * Orchestrates atomic shared components (Search, Dropdown, View Switcher) and unifies 
 * their local state flows into a single outbound reactive stream with dynamic localization.
 */
@Component({
  selector: 'app-product-filter-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, DropdownComponent, SearchInputComponent, ViewSwitcherComponent],
  templateUrl: './product-filter-bar.component.html',
  styleUrl: './product-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFilterBarComponent {
  // --- Structural Generic Input Configuration Keys ---
  // Decoupled translation pointer mappings allowing instant architectural template reuse
  moduleTranslationKey = input<string>('COMMON.PRODUCTS');
  entitySingularTranslationKey = input<string>('COMMON.PRODUCT_SINGULAR');

  // --- Signal Inputs (Enterprise Core Binding Pattern) ---
  categories = input.required<DropdownItem[]>();

  // --- Clean Reactive Outbound Streams (Modern Output API) ---
  filterChange = output<{ search: string; category: string }>();
  viewModeChange = output<'table' | 'cards'>();
  addNewProduct = output<void>();

  /**
   * Memory Anchor Query Selector (Signal ViewChild)
   * Captures the nested SearchInput instance to trigger clean imperative reset side-effects.
   */
  private searchInputChild = viewChild(SearchInputComponent);

  // --- Local Encapsulated States (View-Synchronized Signals) ---
  protected currentViewMode = signal<'table' | 'cards'>('table');
  protected selectedCategoryValue = signal<string>('All Categories');
  private currentSearchValue = ''; 

  /**
   * Accumulates debounced search queries and updates data streams instantly.
   */
  protected onSearch(value: string): void {
    this.currentSearchValue = value;
    this.emitFilters(); 
  }

  /**
   * Synchronizes category state changes on user dropdown select event.
   */
  protected onCategorySelect(value: string): void {
    this.selectedCategoryValue.set(value);
    this.emitFilters(); 
  }

  /**
   * Handles layout visualization toggle mutations.
   */
  protected onViewModeToggle(mode: 'table' | 'cards'): void {
    this.currentViewMode.set(mode);
    this.viewModeChange.emit(mode);
  }

  /**
   * Evaluates and forces outbound pipeline update dispatches.
   */
  protected onApplyFilters(): void {
    this.emitFilters();
  }

  /**
   * Flushes active query state parameters and components natively via safe signal hooks.
   */
  protected onResetFilters(): void {
    this.selectedCategoryValue.set('All Categories');
    this.currentSearchValue = '';
    
    // Imperatively reset child UI components if alive in the VDOM context
    this.searchInputChild()?.reset();
    this.emitFilters();
  }

  /**
   * Normalizes placeholder labels back to backend-compliant tokens before emission.
   */
  private emitFilters(): void {
    const cat = this.selectedCategoryValue();
    this.filterChange.emit({
      search: this.currentSearchValue,
      category: cat === 'All Categories' ? '' : cat.toLowerCase()
    });
  }
}


