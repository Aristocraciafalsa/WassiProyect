import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, take } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './client-dashboard.component.html',
    styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
    clientData: any = null;
    quantity: number = 4;
    isLoading: boolean = true;
    errorMessage: string = '';
    hasAttemptedServerFetch: boolean = false;

    private authService = inject(AuthService);
    private router = inject(Router);

    constructor() { }

    ngOnInit(): void {
        this.loadClientData();
        this.checkIfAlreadyOrdered(); // TODO: Implementar lógica para verificar si ya ordenó
    }

    private loadClientData(): void {
        this.clientData = this.authService.getClientDataFromStorage();

        if (this.clientData) {
            this.isLoading = false;
            return;
        }

        this.fetchClientDataFromServer();
    }

    private fetchClientDataFromServer(): void {
        this.hasAttemptedServerFetch = true;
        this.isLoading = true;

        this.authService.getClientData().pipe(
            take(1),
            catchError(error => {
                this.errorMessage = 'Error al cargar los datos. Por favor, intente nuevamente.';
                return of(null);
            }),
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe({
            next: (response) => {
                if (response && response.data) {
                    this.clientData = response.data;
                } else {
                    console.warn('La respuesta del servidor no contiene datos del cliente.');
                }
            },
            error: (error) => {
                if (!this.clientData) {
                    this.router.navigate(['/login-cliente']);
                }
            }
        });
    }

    increaseQuantity(): void {
        this.quantity++;
    }

    decreaseQuantity(): void {
        if (this.quantity > 4) {
            this.quantity--;
        }
    }

    placeOrder(): void {
        if (!this.clientData) {
            console.error('No hay datos del cliente para realizar el pedido');
            return;
        }

        this.router.navigate(['/confirmacion-pedido'], {
            state: {
                quantity: this.quantity,
                clientData: this.clientData
            }
        });
    }

    refreshData(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.fetchClientDataFromServer();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login-cliente']);
    }

    private checkIfAlreadyOrdered(): void {
        // TODO: Implementar lógica para llamar a un endpoint del backend
        // que verifique si el cliente ya tiene un pedido pendiente o entregado
        // dentro de la semana actual. Si es así, deshabilitar la opción de pedir.
        console.warn('TODO: Implementar checkIfAlreadyOrdered');
        // Ejemplo (necesitarías un nuevo servicio o usar AuthService para esto):
        // this.pedidoService.checkIfClientOrderedThisWeek().subscribe(ordered => {
        //     this.clienteYaPedido = ordered;
        // });
    }
}