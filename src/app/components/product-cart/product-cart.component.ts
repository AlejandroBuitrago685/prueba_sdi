import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Product } from '../../interfaces/product.interface';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../pipes/truncate-text.pipe';
import { Subject, takeUntil } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrls: ['./product-cart.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe, HttpClientModule],
  providers: [ApiService, AuthService ]
})
export class ProductCartComponent implements OnInit, OnDestroy {

  products: Product[] = []; // Todos los productos disponibles
  totalItems: number = 0; // Total de items del carrito
  cart: any[] = []; // Items del carrito
  filteredProducts: Product[] = []; // Productos filtrados
  categories: string[] = []; // Todas las categorías disponibles
  selectedCategory: string | null = null; // Categoría seleccionada para filtrar

  private destroy$ = new Subject<void>();

  constructor(
    private _apiService: ApiService
  ) { }


  /**
 * Se usa para:
 *  - Se realiza una llamada a la API para obtener todos los productos.
 *  - Se almacena la lista completa de productos en la variable 'products'.
 *  - Se rellena la lista de productos filtrados ('filteredProducts') con todos los productos inicialmente.
 *  - Se extraen las categorías únicas de los productos obtenidos y se almacenan en el array 'categories'.
 */
  ngOnInit(): void {
    this._apiService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe((res: Product[]) => {
      this.products = res;
      this.filteredProducts = res; // Mostrar todos los productos inicialmente sin ningún filtro

      // Extraer categorías únicas para obtener los filtros
      this.categories = [...new Set(res.map(product => product.category))];
    });
  }
  
  /**
 * Filtra los productos según de la categoría seleccionada.
 * 
 * @param category - La categoría seleccionada para filtrar los productos. En caso de ser 'null', se muestran todos los productos, limpiando así el filtro.
 * 
 * Se usa para:
 *  - Si se selecciona una categoría, se filtran los productos para mostrar aquellos que pertenecen a esa categoría seleccionada.
 *  - Si no hay ninguna categoría seleccionada (es decir, si `category` es `null`), se muestran todos los productos.
 */
  filterByCategory(category: string | null): void {
    this.selectedCategory = category;

    if (category) {
      // Filtrar productos por la categoría seleccionada
      this.filteredProducts = this.products.filter(product => product.category === category);
    } else {
      // Mostrar todos los productos si la categoría es null (es decir, la opción "Todos")
      this.filteredProducts = this.products;
    }
  }

  /**
 * Añade un producto al carrito. Si el producto ya existe en el carrito, incrementa su cantidad.
 * Si no existe en el carrito, lo añade con una cantidad inicial de 1.
 * 
 * @param product - El producto que se va a añadir al carrito.
 * 
 * Uso:
 *  - Se verifica si el producto ya está en el carrito.
 *    - Si ya está, se incrementa su cantidad.
 *    - Si no está, se añade al carrito con una cantidad inicial de 1.
 *  - Se actualiza el total de productos en el carrito llamando a 'updateTotalItems()'.
 */
   addToCart(product: any): void {
    const productInCart = this.cart.find(item => item.id === product.id);

    if (productInCart) {
      productInCart.quantity += 1;  // Si ya está en el carrito, aumenta la cantidad
    } else {
      this.cart.push({ ...product, quantity: 1 });  // Si no está, se añade con cantidad 1
    }

    this.updateTotalItems();  // Actualiza el total de productos
  }

  // Método para eliminar productos del carrito
  removeFromCart(product: any): void {
    this.cart = this.cart.filter(item => item.id !== product.id);
    this.updateTotalItems();  // Actualiza el total de productos
  }

  // Método para aumentar la cantidad de un producto
  increaseQuantity(index: number): void {
    this.cart[index].quantity += 1;  // Aumenta la cantidad del producto
    this.updateTotalItems();  // Actualiza el total de productos
  }

  // Método para reducir la cantidad de un producto
  decreaseQuantity(index: number): void {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity -= 1;  // Reduce la cantidad del producto
    } else {
      this.removeFromCart(this.cart[index]);  // Elimina el producto si la cantidad es 1 y se disminuye
    }
    this.updateTotalItems();  // Actualiza el total de productos
  }

  // Calcula el precio total del carrito
  getTotalPrice(): number {
    return parseFloat(this.cart
      .reduce((total, item) => total + (item.price * item.quantity), 0)
      .toFixed(2));
  }

  // Calcula el número total de productos en el carrito
  updateTotalItems(): void {
    this.totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);  // Suma la cantidad de todos los productos
  }

  // Limpia todo el carrito, eliminando los productos agregados
  clearCart(){
    this.cart = [];
    this.totalItems = 0;
  }

  /**
   * Método que se ejecuta cuando el componente se destruye.
   * Emite un valor en el subject destroy$ para cancelar todas las suscripciones activas, evitando así fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
