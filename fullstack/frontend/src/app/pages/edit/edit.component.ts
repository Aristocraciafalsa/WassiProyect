import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericFormComponent } from "../../components/generic-form/generic-form.component";
import { CrudService } from '../../services/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product.model';
import { AlertifyService } from '../../services/alertify.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    GenericFormComponent
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit {
  id!: string;
  model: Product | null = null;

  constructor(
    private crudService: CrudService,
    private alertifyService: AlertifyService, // Inyectado
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.crudService.getProduct(this.id).subscribe({
      next: (res) => {
        this.model = res;
      },
      error: (err) => {
        this.alertifyService.error('Error al cargar el producto'); // Notificación de error
        console.error('Error al cargar producto:', err);
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit(product: Product) {
    this.crudService.updateProduct(this.id, product).subscribe({
      next: () => {
        this.alertifyService.success('Updated Product!'); // Notificación de éxito
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.alertifyService.error('Error al actualizar el producto'); // Notificación de error
        console.error('Error al actualizar:', err);
      }
    });
  }
}