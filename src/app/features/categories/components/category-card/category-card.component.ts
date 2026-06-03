import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Category } from '../../models/category.model';

/**
 * Enterprise Category Domain Card Component
 * -----------------------------------------------------------------------------------
 * A specialized presentational node designed to securely map and bind a strongly-typed
 * `Category` entity model directly onto the localized presentation layout frame.
 * Operates purely within reactive unidirectional data flow boundaries.
 */
@Component({
  selector: 'app-category-card',
  standalone:true,
  imports: [],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class CategoryCardComponent {
  category = input.required<Category>();

}
