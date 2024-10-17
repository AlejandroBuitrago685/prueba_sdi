import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { Product } from '../../interfaces/product.interface';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiURL = environment.apiUrl;
  private picsumApiUrl = environment.imageApi;

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProductsPaginated(limit: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiURL}/products?limit=${limit}`);
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
