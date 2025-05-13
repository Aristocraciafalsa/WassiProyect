import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clonar la request para añadir el token
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authService.getToken() || ''}`
    }
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login-admin-operario']);
      }
      return throwError(() => error);
    })
  );
};