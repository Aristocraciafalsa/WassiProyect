import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface AuthResponse {
    token: string;
    user: {
        id: string;
        role: 'client' | 'administrator' | 'operator';
        email?: string;
        companyName?: string;
    };
}

interface RegisterRequest {
    role: 'client' | 'administrator' | 'operator';
    email?: string;
    password?: string;
    companyName?: string;
    nit?: string;
    address?: string;
    location?: string;
    phoneNumber?: string;
    contactName?: string;
}

interface ClientData {
    companyName: string;
    nit: string;
    address: string;
    location: string;
    phoneNumber: string;
    contactName: string;
    email: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface ClientDataResponse extends ApiResponse<ClientData> {}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly apiUrl = 'http://localhost:8000/api/auth';
    private readonly storageKey = 'auth_data';
    private readonly clientDataKey = 'client_data';
    private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    private authDataSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredAuthData());
    public authData$ = this.authDataSubject.asObservable();

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    private getStoredAuthData(): AuthResponse | null {
        if (!this.isBrowser) return null;
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    public handleAuthResponse(response: AuthResponse): void {
        this.setAuthData(response);
        const redirectTo = this.getRedirectRoute(response.user.role);
        this.router.navigate([redirectTo]);
    }

    public handleClientDataResponse(data: ClientData): void {
        if (data) {
            this.setClientData(data);
        } else {
            console.error('Error: Datos del cliente recibidos son null o undefined.');
        }
    }

    register(userData: RegisterRequest): Observable<{ message: string; user: any }> {
        if (!userData.role) {
            return throwError(() => new Error('El rol es requerido'));
        }

        let registrationUrl = `${this.apiUrl}/register`;

        if (userData.role === 'administrator') {
            registrationUrl = `${this.apiUrl}/register/admin`;
            if (!userData.email) {
                return throwError(() => new Error('El email es requerido para el administrador'));
            }
        } else if (userData.role === 'operator') {
            registrationUrl = `${this.apiUrl}/register/operator`;
            if (!userData.email) {
                return throwError(() => new Error('El email es requerido para el operario'));
            }
        } else if (userData.role === 'client') {
            const requiredFields = ['email', 'companyName', 'nit', 'address', 'location', 'phoneNumber', 'contactName'];
            const missingFields = requiredFields.filter(field => !userData[field as keyof RegisterRequest]);
            if (missingFields.length > 0) {
                return throwError(() => new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`));
            }
        } else {
            return throwError(() => new Error('Rol de usuario inválido'));
        }

        return this.http.post<{ message: string; user: any }>(
            registrationUrl,
            userData,
            { headers: this.headers }
        ).pipe(
            catchError(this.handleError)
        );
    }

    loginCliente(code: string): Observable<AuthResponse> {
        if (!/^\d{6}$/.test(code)) {
            return throwError(() => new Error('El código debe tener exactamente 6 dígitos'));
        }
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/login-cliente`,
            { code },
            { headers: this.headers }
        ).pipe(
            tap(response => this.setAuthData(response)), // Guardar datos al iniciar sesión
            catchError(this.handleError)
        );
    }

    loginAdminOperario(email: string, password: string): Observable<AuthResponse> {
        if (!email || !password) {
            return throwError(() => new Error('Email y contraseña son requeridos'));
        }
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/login-admin-operario`,
            { email, password },
            { headers: this.headers }
        ).pipe(
            tap(response => this.setAuthData(response)), // Guardar datos al iniciar sesión
            catchError(this.handleError)
        );
    }

    getClientData(): Observable<ClientDataResponse> {
        const token = this.getToken();
        if (!token) {
            return throwError(() => new Error('No hay token disponible'));
        }
        return this.http.get<ClientDataResponse>(
            `${this.apiUrl}/client-data`,
            { headers: this.headers.append('Authorization', `Bearer ${token}`) }
        ).pipe(
            tap(data => console.log('Datos del cliente recibidos:', data)),
            catchError(this.handleError)
        );
    }

    getAuthData(): AuthResponse | null {
        return this.authDataSubject.value;
    }

    getToken(): string | null {
        return this.authDataSubject.value?.token || null;
    }

    logout(): void {
        if (!this.isBrowser) return;
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.clientDataKey);
        this.authDataSubject.next(null); // Emitir null al hacer logout
        this.router.navigate(['/login-admin-operario']);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getUserRole(): 'client' | 'administrator' | 'operator' | null {
        return this.authDataSubject.value?.user.role || null;
    }

    getClientDataFromStorage(): ClientData | null {
        if (!this.isBrowser) return null;
        const data = localStorage.getItem(this.clientDataKey);
        return data ? JSON.parse(data) : null;
    }

    private preparePayload(userData: RegisterRequest): RegisterRequest {
        return {
            role: userData.role,
            ...(userData.role !== 'client' && {
                email: userData.email,
                password: userData.password
            }),
            ...(userData.role === 'client' && {
                companyName: userData.companyName,
                nit: userData.nit,
                address: userData.address,
                location: userData.location,
                phoneNumber: userData.phoneNumber,
                contactName: userData.contactName
            })
        };
    }

    private getRedirectRoute(role: string): string {
        switch (role) {
            case 'administrator': return '/admin-dashboard';
            case 'operator': return '/operario-dashboard';
            default: return '/client-dashboard';
        }
    }

    private setAuthData(data: AuthResponse): void {
        if (this.isBrowser) {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.authDataSubject.next(data); // Emitir los datos al BehaviorSubject
        }
    }

    private setClientData(data: ClientData): void {
        if (this.isBrowser) {
            localStorage.setItem(this.clientDataKey, JSON.stringify(data));
        }
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('Error en la solicitud:', error);
        const errorMessage = error.error?.message || 'Error desconocido';
        return throwError(() => new Error(errorMessage));
    }

    registerAdminOperario(role: 'administrator' | 'operator', email: string): Observable<{ message: string; user: any }> {
        const url = `${this.apiUrl}/register/${role}`;
        return this.http.post<{ message: string; user: any }>(
            url,
            { email },
            { headers: this.headers }
        ).pipe(
            catchError(this.handleError)
        );
    }
}