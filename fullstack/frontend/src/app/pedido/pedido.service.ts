// pedido.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Asegúrate de la ruta correcta a tu AuthService

// Define una interfaz para el tipo de dato 'Pedido' (ajusta según la estructura de tu respuesta del backend)
export interface Pedido {
    _id: string;
    clienteId: { // Define clienteId como un objeto
        _id: string;
        email?: string;
        contactName?: string;
        companyName?: string;
        address?: string;
        location?: string;
        phoneNumber?: string;
        nit?: string; // ¡Añadimos la propiedad nit!
        // ... otros campos del usuario que necesites ...
    };
    cantidadCanastillas: number;
    fechaPedido: Date;
    fechaEntrega: Date;
    nombreCliente: string;
    direccionCliente: string;
    localidadCliente: string;
    telefonoCliente: string;
    estado: string;
    fechaEntregado?: Date;
    detallesEntrega?: string;
    // Los campos de la empresa AHORA ESTÁN DENTRO de clienteId
}

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private apiUrl = 'http://localhost:8000/api/pedidos'; // Ajusta la URL de tu backend si es diferente
    private authService = inject(AuthService); // Inyecta tu servicio de autenticación
    private http = inject(HttpClient);

    listarPedidos(filtroLocalidad?: string, filtroEstado?: string, filtroFechaPedido?: Date): Observable<Pedido[]> {
        let params = new HttpParams();
        let headers = new HttpHeaders();
        const token = this.authService.getToken(); // Asume que tienes un método para obtener el token en tu AuthService

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        if (filtroLocalidad) {
            params = params.set('localidad', filtroLocalidad);
        }
        if (filtroEstado) {
            params = params.set('estado', filtroEstado);
        }
        if (filtroFechaPedido) {
            // Formatea la fecha al formatoYYYY-MM-DD que espera tu backend
            const fechaFormateada = new Date(filtroFechaPedido).toISOString().slice(0, 10);
            params = params.set('fechaPedido', fechaFormateada);
        }

        return this.http.get<Pedido[]>(`${this.apiUrl}/listar`, { params, headers });
    }

    obtenerDetallePedido(id: string): Observable<Pedido> {
        const token = this.authService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get<Pedido>(`${this.apiUrl}/${id}`, { headers });
    }

    marcarPedidoComoEntregado(id: string): Observable<any> {
        const token = this.authService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        const body = { estado: 'Entregado', fechaEntregado: new Date() }; // Enviamos el nuevo estado y la fecha de entrega
        return this.http.put(`${this.apiUrl}/${id}`, body, { headers });
    }
}