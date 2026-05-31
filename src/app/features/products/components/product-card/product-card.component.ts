import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../models/product';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Enterprise Product Domain Card Component
 * -----------------------------------------------------------------------------------
 * A specialized presentational node designed to securely map and bind a strongly-typed
 * `Product` entity model directly onto the localized presentation layout frame.
 * Operates purely within reactive unidirectional data flow boundaries.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  /** * The immutable, strongly-typed domain model payload representing 
   * the active resource record stream to be rendered.
   */
  product = input.required<Product>();
}

