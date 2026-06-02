import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast/toast.service';
import { NgClass } from '@angular/common';

/**
 * Enterprise Toast Notification Projection Component
 * -----------------------------------------------------------------------------------
 * Acts as the UI projection layer for system-wide notification streams.
 * Consumes reactive toast states directly from the ToastService to render
 * ephemeral feedback messages to the user.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {

  /** Injected global notification stream manager */
  protected toastService = inject(ToastService);
 
}