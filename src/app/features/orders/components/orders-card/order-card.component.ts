import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Order } from '../../models/order.model';

/**
 * OrderCardComponent
 * -----------------------------------------------------------------------------------
 * Presentational Component (Dumb Component) responsible for rendering order details.
 * Implements a strict unidirectional data flow by receiving entity data via 
 * Input signals, ensuring optimal change detection performance.
 */
@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCardComponent {
  
  /** * The order domain entity payload.
   * Marked as required to guarantee the component is never instantiated 
   * without necessary data.
   */
  order = input.required<Order>();
}