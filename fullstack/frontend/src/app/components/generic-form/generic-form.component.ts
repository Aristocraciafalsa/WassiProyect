import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './generic-form.component.html',
  styleUrls: ['./generic-form.component.css']
})
export class GenericFormComponent implements OnInit {
  @Input() modelProduct: Product; // Se añade ! para indicar que se inicializará después
  @Output() submitValues = new EventEmitter<Product>(); // Corregida la sintaxis

  formProduct!: FormGroup; // Se añade ! para indicar que se inicializará después

  constructor(
    private formBuilder: FormBuilder,
    private crudService: CrudService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.formProduct = this.formBuilder.group({ // Asignación correcta al formProduct
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]], // Validación adicional para precio
      stock: ['', [Validators.required, Validators.min(0)]] // Validación adicional para stock
    });

    // Si hay un modelo, actualiza el formulario con sus valores
    if (this.modelProduct !== undefined) {
      this.formProduct.patchValue(this.modelProduct);
    }
  }

  onSubmit(): void {
    if (this.formProduct.valid) {
      this.submitValues.emit(this.formProduct.value);
    }
  }
}