import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumnConfig } from '../../../models/table.model';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Enterprise Highly-Reusable Generic Table Component
 * -----------------------------------------------------------------------------------
 * A strongly-typed presentational grid engine designed to ingest and display arbitrary
 * tabular datasets using an abstract structure array configuration matrix.
 * Leverages TypeScript Generics to guarantee strict domain model context preservation.
 *
 * @template T Structural entity constraint reinforcing record type safety layouts
 */
@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent<T extends Record<string, any> = Record<string, any>> {
  /** The tabular dataset pool collection stream projected onto rows layout matrices */
  data = input.required<T[]>(); 

  /** The structural cell mapping blueprint configurations driving column layout visibility */
  config = input.required<TableColumnConfig[]>(); 

  /** Emits the subject dataset row record object structure upstream upon an interactive trigger */
  rowClick = output<T>();

  /** Broadcasts a dual-token action payload context upstream to execute resource mutations */
  actionClick = output<{ action: string; row: T }>();

  /**
   * Normalizes and maps incoming dynamic API cell tokens (Strings or Numbers)
   * to their respective semantic SCSS theme component color utility classes.
   *
   * @param value The raw cellular cell value extracted from the row record
   * @param key The specific configuration column object property key metadata
   * @returns A safe normalized lower-case string token matching the target style sheet class rules
   */
  protected getBadgeClass(value: any, key: string): string {
    // 1. Defensive Boundary Check: Resolve empty, null, or missing payloads immediately
    if (value === null || value === undefined || value === '') {
      return 'info';
    }
    
    // Normalize token baseline state into an isolated safe string sequence
    const safeStringValue = String(value).toLowerCase().trim();

    // 2. Specialized Domain Logic: Dynamic Inventory Stock Level Indicator Mapping
    if (key === 'stock') {
      const numericStock = Number(safeStringValue);
      
      if (numericStock === 0) return 'danger';     // Depleted Assets: Out of stock threshold
      if (numericStock < 10) return 'warning';    // Restricted Availability: Low inventory threshold alert boundary
      return 'success';                           // Stable Asset Pool: Fully available and stocked status
    }

    // 3. Specialized Domain Logic: Standardize default static numeric presentations (e.g., Prices)
    if (key === 'price') {
      return 'info'; // Fallback presentation layer constraint for flat currency metrics
    }

    // 4. Fallback Default: Pass clean textual labels (e.g., Status flags like 'delivered' or 'pending')
    return safeStringValue;
  }
}

