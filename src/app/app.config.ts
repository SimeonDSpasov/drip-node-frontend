import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions, withIncrementalHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
     provideClientHydration(withEventReplay()),
     provideAnimations(),
     provideHttpClient(withFetch()),
     provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), withComponentInputBinding(), withRouterConfig({ onSameUrlNavigation: 'reload' })),
     provideClientHydration(withIncrementalHydration(), withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true, includeHeaders: ['Authorization-Refresh', 'Authorization-Access'] })),
    ]
};
