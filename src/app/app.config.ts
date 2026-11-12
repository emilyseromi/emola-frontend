import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore, provideState } from '@ngrx/store';
import { routes } from './app.routes';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { appStore } from './store/app.store';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { RegistrationEffects } from './state/emola.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authFeature } from './state/admin.features';
import { AuthEffects } from './state/admin.effects';

// new imports

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideStore(appStore),
    provideState(authFeature), // new: registers the auth slice next to your existing state
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])), // new: interceptor added
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
    provideEffects([RegistrationEffects, AuthEffects]), // new: auth effects added
  ],
};
