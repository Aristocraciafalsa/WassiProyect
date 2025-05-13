import { Component, OnInit, inject } from '@angular/core'; // Añade OnInit aquí
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule], // Corregido formato y añadido CommonModule
    selector: 'app-client-order',
    templateUrl: './client-order.component.html',
    styleUrls: ['./client-order.component.css']
})
export class ClientOrderComponent implements OnInit {
    userData: any;
    basketCount = 4; // Valor mínimo

    private authService = inject(AuthService);

    constructor() { }

    ngOnInit(): void { // Tipo de retorno añadido
        // Asumiendo que AuthService tiene un método para obtener los datos del usuario autenticado
        this.userData = this.authService.getAuthData(); // Usa getAuthData() o el método correcto en tu AuthService
        if (!this.userData) {
            console.warn('No user data found.');
            // Podrías redirigir al login aquí si es necesario
        }
    }

    validateBaskets(): void {
        if (this.basketCount < 4) {
            this.basketCount = 4;
        }
    }

    placeOrder(): void {
        // Lógica para crear el pedido
        console.log('Pedido realizado con:', this.basketCount, 'canastillas y usuario:', this.userData);
        // Aquí llamarías a tu servicio de pedidos
    }
}