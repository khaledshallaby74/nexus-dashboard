import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { apiInterceptor } from './core/interceptors/api.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new (TranslateHttpLoader as any)(http, './assets/i18n/', '.json');}
export const appConfig: ApplicationConfig = {
  
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptors([apiInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory : HttpLoaderFactory,
          deps: [HttpClient],
        },
        fallbackLang: 'en',
      })
    ),
    { provide: TRANSLATE_HTTP_LOADER_CONFIG, useValue: {} },
  ],
};
