import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PedidoService, Pedido } from '../pedido/pedido.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-detalle-pedido',
    standalone: true,
    imports: [CommonModule, DatePipe, SweetAlert2Module],
    templateUrl: './detalle-pedido.component.html',
    styleUrls: ['./detalle-pedido.component.scss'],
    providers: [DatePipe] // ¡Proporcionamos DatePipe aquí!
})
export class DetallePedidoComponent implements OnInit {
    pedidoId: string | null = null;
    pedidoDetalle: Pedido | null = null;
    mensajeError: string = '';
    mensajeExito: string = '';
    isLoadingEntrega: boolean = false;

    private route = inject(ActivatedRoute);
    private pedidoService = inject(PedidoService);
    private datePipe = inject(DatePipe);

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pedidoId = params.get('id');
            if (this.pedidoId) {
                this.cargarDetallePedido(this.pedidoId);
            }
        });
    }

    cargarDetallePedido(id: string): void {
        this.pedidoService.obtenerDetallePedido(id).subscribe(
            (pedido) => {
                this.pedidoDetalle = pedido;
                console.log('Detalle del pedido recibido:', this.pedidoDetalle);
            },
            (error) => {
                console.error('Error al cargar el detalle del pedido:', error);
                this.mensajeError = 'Error al cargar los detalles del pedido.';
            }
        );
    }

    marcarComoEntregado(): void {
        if (!this.pedidoDetalle) {
            this.mensajeError = 'No hay información del pedido para marcar como entregado.';
            return;
        }

        const fechaEntregaPedido = new Date(this.pedidoDetalle.fechaEntrega);
        const hoy = new Date();
        const fechaEntregaFormateada = this.datePipe.transform(fechaEntregaPedido, 'yyyy-MM-dd');
        const hoyFormateado = this.datePipe.transform(hoy, 'yyyy-MM-dd');

        if (fechaEntregaFormateada !== hoyFormateado) {
            Swal.fire({
                title: '¡Atención!',
                text: `No se puede marcar como entregado hasta la fecha de entrega oficial: ${fechaEntregaFormateada}`,
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        this.isLoadingEntrega = true;
        this.mensajeError = '';
        this.mensajeExito = '';

        this.pedidoService.marcarPedidoComoEntregado(this.pedidoDetalle._id).subscribe({
            next: (response) => {
                console.log('Pedido marcado como entregado:', response);
                this.mensajeExito = 'Pedido marcado como entregado exitosamente.';
                this.cargarDetallePedido(this.pedidoDetalle._id);
                this.isLoadingEntrega = false;
            },
            error: (error) => {
                console.error('Error al marcar el pedido como entregado:', error);
                this.mensajeError = 'Error al marcar el pedido como entregado.';
                this.isLoadingEntrega = false;
            }
        });
    }
}