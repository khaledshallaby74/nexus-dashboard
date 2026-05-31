import { Component, input, output, effect, linkedSignal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * SearchInputComponent
 * --------------------------------------------------------------------------------------
 * A high-performance, reactive atomic search field leveraging modern Angular Signals.
 * Features an integrated smart debounce mechanism and structural memory leak prevention 
 * via embedded effect stream side-effect cleanup hooks, eliminating Reactive Forms overhead.
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInputComponent {
  // --- Pure Signal Inputs (Configurable Properties) ---
  placeholder = input<string>('COMMON.SEARCH_PLACEHOLDER');
  ariaLabel = input<string>('Search');
  
  // Outer state pipeline allowing parent layout contexts to force reset mutations
  value = input<string>(''); 

  // --- Custom Outbound Data Streams ---
  searchChange = output<string>();

  // --- Reactive Local State Machine ---
  // linkedSignal synchronizes seamlessly with external [value] mutations without manual ngOnChanges interception
  protected searchState = linkedSignal(() => this.value());

  constructor() {
    // Initializes the internal reactive query consumer pipeline on component instantiation
    this.initSearchDebounceEffect();
  }

  /**
   * Spawns the asynchronous stream tracking search state mutations.
   * Leverages a scoped timer to guarantee debounced data propagation and optimized change detection.
   */
  private initSearchDebounceEffect(): void {
    effect((onCleanup) => {
      const query = this.searchState().trim();
      
      // Establishes a 400ms asynchronous debounce throttling frame to maximize backend API optimization
      const timeoutId = setTimeout(() => {
        this.searchChange.emit(query);
      }, 400);

      // Registers a micro-task callback to immediately clear active timers on subsequent reactive updates
      onCleanup(() => clearTimeout(timeoutId));
    });
  }

  /**
   * DOM Input event listener proxy.
   * Directly mutates the local state signal context on every native keyboard stroke.
   * @param event Native DOM input text event stream
   */
  protected onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchState.set(inputElement.value);
  }

  /**
   * Public API Hook: Programmatically resets the internal state.
   * Flushes local active search terms immediately without generating manual side-effect leaks.
   */
  public reset(): void {
    this.searchState.set('');
  }
}