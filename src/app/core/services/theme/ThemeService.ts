import { effect, inject, Injectable, RendererFactory2, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // Use Renderer2 for safe DOM manipulation (SSR friendly)
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  // Reactive state for the current theme, persisted in LocalStorage
  readonly theme = signal<string>(localStorage.getItem('theme') || 'light');
  constructor(){
    this.initThemeSync(); 
  }
  /**
  * Sets up a reactive effect to synchronize the theme state  with the DOM and LocalStorage.
   */
  private initThemeSync():void {
    effect(()=>{
      const currentTheme = this.theme();
      // Update the data-theme attribute on the root <html> element
      this.renderer.setAttribute(document.documentElement, 'data-theme', currentTheme);
      // Save the preference for the next session
      localStorage.setItem('theme', currentTheme);
    });
  }
  /**
   * Toggles the theme between 'light' and 'dark'
  */
  toggleTheme():void{
    this.theme.update(t=>(t=== 'light' ? 'dark' : 'light'));
  }
}
