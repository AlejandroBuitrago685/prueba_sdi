import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService); 
  const router = inject(Router); 

  const currentUser = authService.getCurrentUser(); // Obtener el usuario actual

  // Comprobar si el usuario tiene un email con dominio @sdi.es
  const isAdmin = currentUser && /^[a-zA-Z0-9._%+-]+@sdi\.es$/.test(currentUser.email);

  if (isAdmin) {
    return true;  // Permitir acceso si es admin
  } else {
    return router.navigate(['/dashboard']);  // Navegar al dashboard si no lo es
  }
};
