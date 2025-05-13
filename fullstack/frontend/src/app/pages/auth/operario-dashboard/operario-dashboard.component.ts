import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Panel de Operario</h1>
      <p>Bienvenido al panel de operaciones</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class OperarioDashboardComponent {}