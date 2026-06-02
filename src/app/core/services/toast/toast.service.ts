import { Injectable, signal } from '@angular/core';

/**
 * Toast Notification Interface
 * -----------------------------------------------------------------------------------
 * Defines the structural contract for notification entities across the application.
 */
export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

/**
 * Enterprise Toast Notification Service
 * -----------------------------------------------------------------------------------
 * Centralizes system-wide ephemeral feedback messages. Manages a reactive stack
 * of notifications, handling automatic expiration timers and stack state integrity.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /** Internal writable state registry for active notifications */
  private toastsState = signal<ToastMessage[]>([]);
  
  /** Public read-only projection of the current toast stack for UI consumption */
  toasts = this.toastsState.asReadonly();

  /** Dispatches a positive feedback notification */
  success(message: string): void { this.show(message, 'success'); }

  /** Dispatches a failure/alert notification */
  error(message: string): void { this.show(message, 'error'); }

  /** Dispatches a warning/caution notification */
  warning(message: string): void { this.show(message, 'warning'); }

  /**
   * Internal display orchestrator.
   * Creates a new notification entity, registers it in the state,
   * and schedules an asynchronous purge task for automated cleanup.
   */
  private show(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    const id = Date.now();
    const newToast: ToastMessage = { id, type, message };

    this.toastsState.update(current => [...current, newToast]);

    // Asynchronous lifecycle management: Auto-purge after 4s visibility window
    setTimeout(() => {
      this.clear(id);
    }, 4000); 
  }

  /**
   * Explicitly removes a notification from the stack by its unique identifier.
   * @param id Targeted entity primary key for removal
   */
  clear(id: number): void {
    this.toastsState.update(current => current.filter(toast => toast.id !== id));
  }
}