import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si el token existe en el almacenamiento local
  if (authService.estaLogueado()) {
    return true; // Deja pasar al usuario
  } else {
    // Si no está logueado, lo mandamos al login
    console.warn('Acceso denegado: redirigiendo al login...');
    router.navigate(['/login']);
    return false; // Bloquea el acceso
  }
};