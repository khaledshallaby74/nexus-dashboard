import { ChangeDetectionStrategy, Component, signal, output, viewChild, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { DropdownItem } from '../../../../shared/models/dropdown.model';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component'; 
import { ViewSwitcherComponent } from '../../../../shared/components/view-switcher/view-switcher.component'; 

/**
 * OrderFilterBarComponent
 * --------------------------------------------------------------------------------------
 * Acts as the declarative mediator for order lifecycle management views.
 * Orchestrates local filtering states (search/status) and synchronizes them with
 * parent-injected configurations to ensure UI consistency.
 */
@Component({
  selector: 'app-order-filter-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, DropdownComponent, SearchInputComponent, ViewSwitcherComponent],
  templateUrl: './order-filter-bar.component.html',
  styleUrl: './order-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderFilterBarComponent {
  
  // --- Dynamic Signal Inputs (Enterprise Pattern) ---
  /** Collection of order status options, provided via dependency injection from the host */
  statuses = input.required<DropdownItem[]>();
  
  /** External status state injected from parent/route context for synchronization */
  selectedStatus = input<string>('All Orders');

  // --- Clean Reactive Outbound Streams ---
  /** Emits composite filter criteria to the host container for domain-level processing */
  filterChange = output<{ search: string; status: string }>();
  
  /** Signals structural layout shifts (Table/Cards) to the host */
  viewModeChange = output<'table' | 'cards'>();

  /** Memory Anchor: Direct reference to the search component for programmatic state resets */
  private searchInputChild = viewChild(SearchInputComponent);

  // --- Local Synchronized States ---
  /** Internal signal tracking the current UI display mode */
  protected currentViewMode = signal<'table' | 'cards'>('table');
  
  /** Internal buffer signal ensuring the dropdown UI reflects the current operational status */
  protected selectedStatusValue = signal<string>('All Orders');
  
  /** Local non-reactive state buffer for search term composition */
  private currentSearchValue = ''; 

  constructor() {
    /**
     * State Synchronization Effect:
     * Maintains parity between the host-injected status and the local dropdown selection.
     * Ensures that programmatic state changes from the router/parent are reflected in the UI.
     */
    effect(() => {
      const externalStatus = this.selectedStatus();
      const availableStatuses = this.statuses();

      if (externalStatus && externalStatus !== 'All Orders') {
        const matchedItem = availableStatuses.find(
          item => item.value.toLowerCase() === externalStatus.toLowerCase()
        );
        this.selectedStatusValue.set(matchedItem ? matchedItem.value : externalStatus);
      } else {
        this.selectedStatusValue.set('All Orders');
      }
    });
  }

  /**
   * Updates internal search buffer and triggers a filter emission stream.
   * @param value The search query string
   */
  protected onSearch(value: string): void {
    this.currentSearchValue = value;
    this.emitFilters(); 
  }

  /**
   * Synchronizes dropdown selection and triggers filter emission.
   * @param value The selected status value from the dropdown
   */
  protected onStatusSelect(value: string): void {
    this.selectedStatusValue.set(value);
    this.emitFilters(); 
  }

  /**
   * Updates view mode and notifies the host for layout restructuring.
   * @param mode The selected view mode ('table' | 'cards')
   */
  protected setViewMode(mode: 'table' | 'cards'): void {
    this.currentViewMode.set(mode);
    this.viewModeChange.emit(mode);
  }

  /**
   * Resets internal state to baseline and propagates the clearing event to host.
   */
  protected onResetFilters(): void {
    this.selectedStatusValue.set('All Orders');
    this.currentSearchValue = '';
    
    // Trigger reset on the child search component reference
    this.searchInputChild()?.reset();
    this.emitFilters();
  }

  /**
   * Normalizes values and dispatches the payload to the orchestrator (parent).
   */
  private emitFilters(): void {
    this.filterChange.emit({
      search: this.currentSearchValue,
      status: this.selectedStatusValue()
    });
  }
}