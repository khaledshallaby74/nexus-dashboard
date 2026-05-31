import { Injectable, signal } from '@angular/core';
import { Toast } from '../../models/notification.model';
import { _ } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Private signal to manage the toast state internally.
   * We use a 'null' initial value to indicate no notification is active.
   */
  private _toast = signal<Toast|null>(null);

  /**
   * Expose the toast state as a read-only signal.
   * This prevents external components from directly modifying the state.
   */
  readonly toast = this._toast.asReadonly();

  /**
   * Displays a notification toast.
   * @param message The text content to display.
   * @param type The style category (defaults to 'error').
   */
  show(message:string, type: 'success'|'error'|'info' = 'error'){
    // Unique ID based on timestamp
    const id = Date.now();
    // Update the state with the new toast data
    this._toast.set({id, message, type});
    // Automatically dismiss the toast after 4 seconds
    setTimeout(()=>{
      this.clear(id)
    }, 4000)
  }

  /**
   * Removes a specific toast from the state if the IDs match.
   * This ensures we don't accidentally clear a newer notification.
   * @param id The unique identifier of the toast to be cleared.
   */
  clear(id:number){
    if(this._toast()?.id === id){
      this._toast.set(null)
    }
  }
}
