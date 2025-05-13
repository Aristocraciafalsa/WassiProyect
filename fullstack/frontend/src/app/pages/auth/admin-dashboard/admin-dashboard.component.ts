import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ListaPedidosComponent } from '../../../lista-pedidos/lista-pedidos.component'; // Asegúrate de la ruta correcta



@Component({

  standalone: true,

  imports: [CommonModule, ListaPedidosComponent], // ¡AÑADE ListaPedidosComponent AQUÍ!

  template: `

    <div class="dashboard-container">

   

      <app-lista-pedidos></app-lista-pedidos>

    </div>

  `,

  styles: [` .dashboard-container {

padding: 2rem;
max-width: 1200px;
margin: 0 auto;

 }`]

})

export class AdminDashboardComponent {}

