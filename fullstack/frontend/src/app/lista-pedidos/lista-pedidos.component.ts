import { Component, OnInit, inject } from '@angular/core';
import { Pedido, PedidoService } from '../pedido/pedido.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importa el Router

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.scss']
})
export class ListaPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  filtroLocalidad: string = '';
  filtroEstado: string = '';
  filtroFechaPedido: Date | null = null;

  private pedidoService = inject(PedidoService);
  private router = inject(Router); // Inyecta el Router

  constructor() { }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.pedidoService.listarPedidos(this.filtroLocalidad, this.filtroEstado, this.filtroFechaPedido)
      .subscribe(
        (pedidos) => {
          this.pedidos = pedidos;
        },
        (error) => {
          console.error('Error al cargar los pedidos:', error);
        }
      );
  }

  filtrarPedidos(): void {
    this.cargarPedidos();
  }

  verDetallePedido(id: string): void {
    this.router.navigate(['/admin-dashboard/pedido', id]);
  }
}