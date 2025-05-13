import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private REST_API: string = 'http://localhost:8000/api/products';
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private httpClient: HttpClient) { }

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(this.REST_API, { headers: this.httpHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener un producto por ID
  getProduct(id: string): Observable<Product> {
    return this.httpClient.get<Product>(`${this.REST_API}/${id}`, { headers: this.httpHeaders }).pipe(
      map((res: any) => res || {}),
      catchError(this.handleError)
    );
  }

  // Crear un nuevo producto
  createProduct(data: Product): Observable<Product> {
    return this.httpClient.post<Product>(this.REST_API, data, { headers: this.httpHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un producto
  updateProduct(id: string, data: Product): Observable<Product> {
    return this.httpClient.put<Product>(`${this.REST_API}/${id}`, data, { headers: this.httpHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un producto
  deleteProduct(id: string): Observable<any> {
    return this.httpClient.delete(`${this.REST_API}/${id}`, { headers: this.httpHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMsg = '';
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMsg = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMsg = `Error del servidor: Código ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMsg);
    return throwError(() => new Error(errorMsg));
  }
}