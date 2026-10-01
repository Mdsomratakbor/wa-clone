import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { PersistencePort } from './core/persistence/persistence.port';
import { LocalStorageAdapter } from './core/persistence/local-storage.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: PersistencePort, useClass: LocalStorageAdapter }
  ]
};
