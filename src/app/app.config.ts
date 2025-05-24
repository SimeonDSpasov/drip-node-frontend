import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions, withIncrementalHydration } from '@angular/platform-browser';

import { authInterceptor } from './interceptors/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
     provideClientHydration(withEventReplay()),
     provideAnimations(),
     provideHttpClient(withInterceptors([ authInterceptor ])),
     provideHttpClient(withFetch()),
     provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), withComponentInputBinding(), withRouterConfig({ onSameUrlNavigation: 'reload' })),
     provideClientHydration(withIncrementalHydration(), withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true, includeHeaders: ['Authorization-Refresh', 'Authorization-Access'] })),
    ]
};
