import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { ViewSwitcherComponent } from '../../../../shared/components/view-switcher/view-switcher.component';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/**
 * Enterprise Category Layout Header & Filter Processor
 * -----------------------------------------------------------------------------------
 * Orchestrates localized search actions, toggles visual layouts via shared switchers,
 * and standardizes UI layout hooks matching global framework styling specs.
 */
@Component({
  selector: 'app-category-filter-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, SearchInputComponent, ViewSwitcherComponent],
  templateUrl: './category-filter-bar.component.html',
  styleUrl: './category-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFilterBarComponent {
  
  // --- Pure Modern Input/Output Streams ---
  
  /** Translation token for the module title */
  moduleTranslationKey = input<string>('COMMON.CATEGORIES');
  
  /** Translation token for the singular entity reference */
  entitySingularTranslationKey = input<string>('COMMON.CATEGORY_SINGULAR');
  
  /** Outbound event emitter for layout structural changes */
  viewModeChange = output<'table' | 'cards'>();

  /** * Internal writable signal managing view state.
   * Note: Defined as a WritableSignal to permit local UI mutations while 
   * synchronizing with external parents via the viewModeChange output.
   */
  currentViewMode = signal<'table' | 'cards'>('table');

  /** Outbound event emitter for search query refinements */
  searchChange = output<string>();
  
  /** Outbound trigger for entity creation flow initiation */
  addNewCategory = output<void>();

  /** * Search Event Interceptor: 
   * Proxies raw input values to the parent via searchChange emission.
   */
  protected onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  /**
   * Layout Toggle Resolver:
   * Updates internal state and propagates the change to parent containers
   * to ensure structural consistency across the application.
   */
  protected setViewMode(mode: 'table' | 'cards'): void {
    this.currentViewMode.set(mode);
    this.viewModeChange.emit(mode);
  }
}