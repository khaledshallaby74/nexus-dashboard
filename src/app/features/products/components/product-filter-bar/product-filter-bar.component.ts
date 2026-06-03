import { ChangeDetectionStrategy, Component, input, output, signal, viewChild, effect } from '@angular/core';
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
  /** Translation key for the module/page title */
  moduleTranslationKey = input<string>('COMMON.PRODUCTS');
  /** Translation key for the entity type (singular) */
  entitySingularTranslationKey = input<string>('COMMON.PRODUCT_SINGULAR');

  // --- Signal Inputs (Enterprise Core Binding Pattern) ---
  /** List of categories for the dropdown selection */
  categories = input.required<DropdownItem[]>();
  
  /** Reactive target injected from upper container state router configuration */
  selectedCategory = input<string>('All Categories');   

  // --- Clean Reactive Outbound Streams (Modern Output API) ---
  /** Unified event stream for combined search and taxonomy filtering */
  filterChange = output<{ search: string; category: string }>();
  /** Event stream for layout structural changes (Table vs Cards) */
  viewModeChange = output<'table' | 'cards'>();
  /** Action trigger for initiating the product creation workflow */
  addNewProduct = output<void>();

  /** Memory Anchor: Direct reference to the search component for programmatic resets */
  private searchInputChild = viewChild(SearchInputComponent);

  // --- Local Encapsulated States (View-Synchronized Signals) ---
  /** Internal signal managing active visual representation state */
  protected currentViewMode = signal<'table' | 'cards'>('table');
  /** Writable signal tracking current dropdown selection */
  protected selectedCategoryValue = signal<string>('All Categories');
  /** Non-reactive state buffer for search term composition */
  private currentSearchValue = ''; 

  constructor() {
    /**
     * State Synchronization Effect:
     * Listens to parent input changes (e.g. Router history state injection) and forces
     * local dropdown state adjustments while handling case-insensitive alignment safely.
     */
    effect(() => {
      const externalCategory = this.selectedCategory();
      const availableCategories = this.categories();

      if (externalCategory && externalCategory !== 'All Categories') {
        const matchedItem = availableCategories.find(
          item => item.value.toLowerCase() === externalCategory.toLowerCase()
        );

        if (matchedItem) {
          this.selectedCategoryValue.set(matchedItem.value);
        } else {
          this.selectedCategoryValue.set(externalCategory);
        }
      } else {
        this.selectedCategoryValue.set('All Categories');
      }
    });
  }

  /**
   * Accumulates debounced search queries and triggers filter emission.
   * @param value The raw search string from the input component
   */
  protected onSearch(value: string): void {
    this.currentSearchValue = value;
    this.emitFilters(); 
  }

  /**
   * Synchronizes category state changes and triggers filter emission.
   * @param value The selected category value
   */
  protected onCategorySelect(value: string): void {
    this.selectedCategoryValue.set(value);
    this.emitFilters(); 
  }

  /**
   * Handles layout visualization toggle mutations.
   * @param mode The selected mode: 'table' or 'cards'
   */
  protected setViewMode(mode: 'table' | 'cards'): void {
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
   * Resets all filter states (search and category) to default values 
   * and triggers a full catalog refresh.
   */
  protected onResetFilters(): void {
    this.selectedCategoryValue.set('All Categories');
    this.currentSearchValue = '';
    
    // Programmatically reset the child search component
    this.searchInputChild()?.reset();
    this.emitFilters();
  }

  /**
   * Normalizes values and dispatches the filter payload to parent containers.
   * Implements mapping logic to translate UI labels to API-compliant query parameters.
   */
  private emitFilters(): void {
    const cat = this.selectedCategoryValue();
    this.filterChange.emit({
      search: this.currentSearchValue,
      category: cat === 'All Categories' ? '' : cat.toLowerCase()
    });
  }
}