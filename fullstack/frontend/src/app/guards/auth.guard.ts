import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];

    return this.authService.authData$.pipe(
      take(1), // Tomar el valor actual del BehaviorSubject
      map(authData => {
        if (!authData?.token) {
          this.redirectToLogin(state.url);
          return false;
        }

        if (requiredRoles && !requiredRoles.includes(authData.user.role)) {
          this.redirectBasedOnRole(authData.user.role);
          return false;
        }

        return true;
      })
    );
  }

  private redirectToLogin(requestedUrl: string): void {
    const isClientRoute = requestedUrl.includes('client');
    const loginRoute = isClientRoute ? '/login-cliente' : '/login-admin-operario';
    this.router.navigate([loginRoute], {
      queryParams: { returnUrl: requestedUrl }
    });
  }

  private redirectBasedOnRole(role: string): void {
    switch(role) {
      case 'administrator':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'operator':
        this.router.navigate(['/operario-dashboard']);
        break;
      case 'client':
        this.router.navigate(['/client-dashboard']);
        break;
      default:
        this.router.navigate(['/login-admin-operario']);
    }
  }
}