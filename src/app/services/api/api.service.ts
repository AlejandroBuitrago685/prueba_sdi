import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { Product } from '../../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiURL = 'https://fakestoreapi.com';
  private picsumApiUrl = 'https://picsum.photos/v2/list?page=2&limit=100';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProductsPaginated(limit: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiURL}/products?limit=${limit}`);
  }

  // Obtener detalles de un producto por su ID
  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.apiURL}/products/${productId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiURL}/products`);
  }

  // Crear un nuevo producto
  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiURL}/products`, product)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar un producto por su ID
  updateProduct(productId: number, product: any): Observable<any> {
    return this.http.put(`${this.apiURL}/products/${productId}`, product)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar un producto por su ID
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/products/${productId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.apiURL}/users`, user);
  }

  getRandomImageUrl(): Observable<string> {
    return this.http.get<any[]>(this.picsumApiUrl).pipe(
      map((photos: any[]) => {
        // Seleccionar una foto aleatoria
        const randomIndex = Math.floor(Math.random() * photos.length);
        const randomPhoto = photos[randomIndex];
        return randomPhoto.url;
      })
    );
  }


  // Manejador de errores común
  private handleError(error: any): Observable<never> {
    console.error('Error en la API', error);
    throw new Error('Error en la API: ' + error.message);
  }
}
