import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, ClientDataResponse } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router'; // ¡Importamos RouterModule!

@Component({
    standalone: true,
    imports: [FormsModule, CommonModule, RouterModule], // ¡Añadimos RouterModule a los imports!
    templateUrl: './cliente-login.component.html',
    styleUrls: ['./cliente-login.component.css']
})
export class ClienteLoginComponent {
    code = '';
    error = '';
    isLoading = false;

    private authService = inject(AuthService);
    private router = inject(Router);

    clearError(): void {
        this.error = '';
    }

    onSubmit(): void {
        this.isLoading = true;
        this.error = '';

        if (!/^\d{6}$/.test(this.code)) {
            this.error = 'El código debe tener exactamente 6 dígitos numéricos';
            this.isLoading = false;
            return;
        }

        this.authService.loginCliente(this.code).subscribe({
            next: (response) => {
                this.authService.handleAuthResponse(response);
                this.handleClientData();
            },
            error: (err) => {
                this.handleError(err);
            }
        });
    }

    private handleClientData(): void {
        this.authService.getClientData().subscribe({
            next: (clientDataResponse: ClientDataResponse | null) => {
                if (clientDataResponse && clientDataResponse.data) {
                    this.authService.handleClientDataResponse(clientDataResponse.data);
                    this.navigateToDashboard();
                } else {
                    console.warn('No se recibieron datos del cliente después del login.');
                    this.navigateToDashboard();
                }
            },
            error: (err) => {
                this.handleError(err);
            }
        });
    }
    private navigateToDashboard(): void {
        this.router.navigate(['/client-dashboard'])
            .then(() => this.isLoading = false)
            .catch(err => {
                console.error('Error de navegación:', err);
                this.isLoading = false;
            });
    }

    private handleError(error: any): void {
        this.error = this.getUserFriendlyError(error);
        this.isLoading = false;
        console.error('Error en el proceso de login:', error);
    }

    private getUserFriendlyError(error: any): string {
        const errorMap: Record<string, string> = {
            'Código no registrado': 'El código ingresado no existe',
            'Network Error': 'Error de conexión con el servidor',
            'Timeout': 'El servidor no respondió',
            'Internal Server Error': 'Error interno del servidor',
            'Invalid token': 'Sesión inválida, por favor ingrese nuevamente',
            'No hay token disponible': 'Sesión no válida, por favor inicie sesión nuevamente'
        };

        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        return errorMap[errorMessage] || errorMessage;
    }
}