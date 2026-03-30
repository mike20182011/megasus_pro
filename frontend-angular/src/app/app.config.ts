import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // <-- Importa withInterceptorsFromDi
import { HTTP_INTERCEPTORS } from '@angular/common/http'; // <-- Importa esto
import { AuthInterceptor } from './interceptors/auth-interceptor'; // <-- Importa tu interceptor

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    
    // Modificamos esto para que acepte interceptores
    provideHttpClient(
      withInterceptorsFromDi() 
    ),

    // Registramos formalmente el interceptor en el sistema
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};