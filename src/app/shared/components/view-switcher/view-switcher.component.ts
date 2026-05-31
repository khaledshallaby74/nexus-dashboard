import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * ViewSwitcherComponent
 * ---------------------------------------------------------
 * A highly decoupled, pure presentational (dumb) component 
 * that renders UI controls to toggle layout visualization modes.
 * Follows a strict unidirectional data flow contract.
 */
@Component({
  selector: 'app-view-switcher',
  standalone: true, // Guarantees self-contained modular loading within NEXUS shared scope
  imports: [TranslateModule],
  templateUrl: './view-switcher.component.html',
  styleUrl: './view-switcher.component.scss',
})
export class ViewSwitcherComponent {
  // --- Modern Reactive Signal Inputs ---
  // Expresses the active structural representation state inherited from the parent shell
  currentMode = input.required<'table' | 'cards'>();
  
  // --- Custom Outbound Stream Events ---
  // Emits the target layout presentation token exclusively when a distinct state mutation occurs
  modeChange = output<'table' | 'cards'>();

  /**
   * Action event handler attached to individual segment option triggers.
   * Includes a performance guard block to intercept redundant layout recalculation cycles.
   * @param mode Target layout representation variant chosen by the user ('table' or 'cards')
   */
  protected changeMode(mode: 'table' | 'cards'): void {
    // Performance Optimization Guard: Prevents outbound propagation if the mode is already active
    if (this.currentMode() !== mode) {
      this.modeChange.emit(mode);
    }
  }
}