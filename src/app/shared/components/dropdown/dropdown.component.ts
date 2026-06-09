import { Component, signal, input, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core'; // Added for dynamic localization hooks
import { ClickOutside } from '../../directives/click-outside';
import { DropdownItem } from '../../models/dropdown.model';

/**
 * DropdownComponent
 * --------------------------------------------------------------------------------------
 * A highly scalable, standalone reusable control element built on Angular Signals.
 * Integrates declarative reactive translations dynamically mapped for generic datasets.
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, TranslateModule, ClickOutside],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent {
  /** Required list of items to be rendered in the dropdown menu */
  items = input.required<DropdownItem[]>();
  
  /** Current selected value to handle the 'active' state highlighting */
  selectedValue = input<any>();
  
  /** Fallback text when no item is selected */
  placeholder = input<string>('Select Option');
  
  /** Emits the selected value to the parent component on change */
  selectionChange = output<any>();
  
  /** Internal state to manage visibility of the dropdown menu */
  isOpen = signal(false);

  /** Toggles the dropdown menu visibility state */
  toggle() {
    this.isOpen.update(v => !v);
  }

  /** Force closes the dropdown (e.g., on selection or click outside) */
  close() {
    this.isOpen.set(false);
  }

  /** Handles item selection, emits value, and closes the menu */
  select(item: DropdownItem) {
    this.selectionChange.emit(item.value);
    this.close();
  }

  /** Computed getter to display the label associated with the selected value */
  selectedLabel = computed(() => {
    const currentVal = this.selectedValue(); 
    const item = this.items().find(i => i.value === currentVal);
    return item ? item.label : this.placeholder();
  });
}