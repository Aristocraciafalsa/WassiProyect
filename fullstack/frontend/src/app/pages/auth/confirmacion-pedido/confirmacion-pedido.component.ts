import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { PedidoService } from '../../../services/pedido.service';
import { FormsModule } from '@angular/forms'; // ¡Importante!

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule], // ¡Añade FormsModule a los imports!
    templateUrl: './confirmacion-pedido.component.html',
    styleUrls: ['./confirmacion-pedido.component.css']
})
export class ConfirmacionPedidoComponent implements OnInit {
    clientData: any;
    quantity: number = 4;
    minQuantity = 4;
    confirmandoPedido: boolean = false;
    mensaje: string = '';
    error: string = '';

    private authService = inject(AuthService);
    private router = inject(Router);
    private pedidoService = inject(PedidoService);

    constructor() {
        this.clientData = this.authService.getClientDataFromStorage();
        if (!this.clientData) {
            this.router.navigate(['/login-cliente']);
        }

        const navigation = this.router.getCurrentNavigation();
        this.quantity = navigation?.extras.state?.['quantity'] || this.minQuantity;
    }

    ngOnInit(): void {
        console.log('ConfirmacionPedidoComponent initialized');
    }

    confirmOrder(): void {
        if (!this.confirmandoPedido) {
            this.confirmandoPedido = true;
            this.pedidoService.crearPedido(this.quantity).subscribe({
                next: (response) => {
                    alert(`GRACIAS POR REALIZAR SU COMPRA\n\nSu pedido de ${this.quantity} canastillas será entregado el próximo Jueves`);
                    this.authService.logout();
                    this.router.navigate(['/login-cliente']);
                },
                error: (err) => {
                    this.error = err.error?.message || 'Error al confirmar el pedido';
                    this.confirmandoPedido = false;
                    console.error('Error al confirmar el pedido:', err);
                }
            });
        }
    }

    updateQuantity(): void {
        if (this.quantity < this.minQuantity) {
            this.quantity = this.minQuantity;
        }
    }
}