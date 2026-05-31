import { effect, inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  // Injecting ngx-translate service and Renderer2 for DOM safety
  private readonly translate = inject(TranslateService);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  // Reactive signal holding the current language, initialized from LocalStorage
  readonly lang = signal<string>(localStorage.getItem('lang') || 'en');

  constructor(){
    this.setupTranslateService();
    this.initLanguageSync();
  }
  /**
   * Performs the initial configuration for the translation library
   */
  private setupTranslateService(): void {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setFallbackLang('en');
  }
  /**
   * Sets up an effect to synchronize language changes with the DOM and LocalStorage
   */
  private initLanguageSync():void {
    effect(()=>{
      const currentLang = this.lang();
      // Determine document direction based on the language
      const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
      // Apply translation file usage
      this.translate.use(currentLang);
      // Update HTML attributes for SEO and Layout (RTL/LTR support)
      this.renderer.setAttribute(document.documentElement, 'dir', dir);
      this.renderer.setAttribute(document.documentElement, 'lang', currentLang);
      // Persist user selection to LocalStorage
      localStorage.setItem('lang', currentLang);
    })
  }
  /**
   * Public method to change the application's language
   * @param newLang The language code (e.g., 'en' or 'ar')
   */
  switchLang(newLang:string):void{
    this.lang.set(newLang)
  }
}
