import { Component } from '@angular/core';
import { GenericFormComponent } from "../../components/generic-form/generic-form.component";
import { Product } from '../../models/product.model';
import { CrudService } from '../../services/crud.service';
import { Router } from '@angular/router';
import { AlertifyService } from '../../services/alertify.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [GenericFormComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {
  constructor(
    private router:Router,
    private crudService:CrudService,
    private alertifyService:AlertifyService

  ){

  }

  onSubmit(product: Product) {
    // Convertir price y stock a number (si vienen como string)
    const productData = {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock)
    };
  
    this.crudService.createProduct(productData).subscribe({
      next: () => {
        this.alertifyService.success('Added Product!')
        this.router.navigateByUrl("/");
      },
      error: (error) => {
        console.error('Error creating new product', error);
        // Opcional: Mostrar mensaje de error al usuario
      }
    });
  }

}
