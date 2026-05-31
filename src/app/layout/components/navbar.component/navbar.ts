import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme/ThemeService';
import { LanguageService } from '../../../core/services/language/languageService';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslateModule, DropdownComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class NavbarComponent  {
  // Inject required services
  themeService = inject(ThemeService);
  layoutService = inject(LayoutService);
  languageService = inject(LanguageService);
  /** 
   * Static collection of supported languages for the application.
   * Used by the shared dropdown to facilitate language switching.
  */
  readonly languages = [
    { label: 'Arabic', value: 'ar' },
    { label: 'English', value: 'en' }
  ];
  /** Select language and close the menu */
  selectLang(lang: string) {
    this.languageService.switchLang(lang);
  }
  /** Dynamically change theme icon based on current theme */
  get themeIcon(): string {
    return this.themeService.theme() === 'light' ? '🌙' : '☀️';
  }
}
