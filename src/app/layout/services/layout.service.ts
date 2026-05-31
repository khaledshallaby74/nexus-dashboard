import { computed, Injectable, signal } from '@angular/core';
/**
 * Service responsible for managing the application's layout state,
 * specifically handling the sidebar visibility and responsiveness.
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  /** * Reactive state for sidebar visibility. 
   * Initialized based on screen width (Desktop vs Mobile).
   */
  private readonly _isSidebarOpen = signal<boolean>(window.innerWidth > 992);
  /** Exposed as Readonly to ensure state changes only happen through service methods */
  readonly isSidebarOpen = this._isSidebarOpen.asReadonly();
  /** Derived state: Returns true if the sidebar is currently hidden/collapsed */
  readonly isCollapsed = computed(()=> !this._isSidebarOpen());
  constructor(){
    /** Perform an initial check to sync sidebar state with current viewport size */
    this.checkScreenSize();
  }
  /** Toggles the current sidebar visibility state */
  toggleSidebar():void {
    this._isSidebarOpen.update(state => !state);
  };
  /** Explicitly hides the sidebar (useful for mobile navigation overlays) */
  closeSidebar():void {
    this._isSidebarOpen.set(false);
  };
  /** Explicitly shows the sidebar */
  openSidebar():void {
    this._isSidebarOpen.set(true);
  };
  /**
   * Syncs the sidebar state based on the standard breakpoint (992px).
   * Forces the sidebar to close on smaller screens to optimize real estate.
   */
  private checkScreenSize():void {
    if(window.innerWidth < 992){
      this._isSidebarOpen.set(false)
    }
  }
}
