import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

interface Pedido {
    _id?: string;
    clienteId: string;
    cantidadCanastillas: number;
    fechaPedido?: Date;
    fechaEntrega: Date;
    estado: 'Pendiente' | 'Entregado';
    nombreCliente: string;
    direccionCliente: string;
    localidadCliente: string;
    telefonoCliente: string;
    // ... otras propiedades
}

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private apiUrl = 'http://localhost:8000/api/pedidos'; // ¡Asegúrate de que esta sea la URL de tu backend!

    private cantidadPedidoSubject = new BehaviorSubject<number>(0);
    public cantidadPedido$ = this.cantidadPedidoSubject.asObservable();

    constructor(private http: HttpClient) { }

    setCantidadPedido(cantidad: number) {
        this.cantidadPedidoSubject.next(cantidad);
    }

    getCantidadPedido(): number {
        return this.cantidadPedidoSubject.value;
    }

    crearPedido(cantidadCanastillas: number): Observable<{ message: string; pedido: Pedido }> {
        return this.http.post<{ message: string; pedido: Pedido }>(`${this.apiUrl}/crear`, { cantidadCanastillas });
    }

    listarPedidos(localidad?: string, estado?: 'Pendiente' | 'Entregado'): Observable<Pedido[]> {
        let params: any = {};
        if (localidad) {
            params.localidad = localidad;
        }
        if (estado) {
            params.estado = estado;
        }
        return this.http.get<Pedido[]>(`${this.apiUrl}/listar`, { params });
    }

    obtenerDetallePedido(id: string): Observable<Pedido> {
        return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
    }

    marcarPedidoEntregado(id: string): Observable<{ message: string; pedido: Pedido }> {
        return this.http.patch<{ message: string; pedido: Pedido }>(`${this.apiUrl}/${id}/entregado`, {});
    }
}