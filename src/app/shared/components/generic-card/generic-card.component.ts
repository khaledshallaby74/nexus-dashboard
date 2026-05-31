import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Enterprise Generic Card Wrapper Component
 * -----------------------------------------------------------------------------------
 * Acts as a pure presentational (dumb) component defining the global structural 
 * layout, theme encapsulation, and standard micro-interactions for system cards.
 * Delegating all dynamic behavioral operations upstream via strict reactive event emissions.
 */
@Component({
  selector: 'app-generic-card',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './generic-card.component.html',
  styleUrl: './generic-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericCardComponent {
  /** Emits a void signal upstream when the global container layout wrapper is triggered */
  cardClick = output<void>();
  
  /** Propagates an execution event trigger to launch mutations or updates on the parent entity frame */
  edit = output<void>();
  
  /** Propagates an execution event trigger to invoke destructive removal actions on the parent entity frame */
  delete = output<void>();
}