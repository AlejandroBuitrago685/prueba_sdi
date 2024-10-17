import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { HttpClientModule } from '@angular/common/http';
import { Product } from '../../interfaces/product.interface';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../pipes/table-filter.pipe';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    FilterPipe,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [
    ApiService,
    MessageService,
    ConfirmationService]
})
export class ProductListComponent implements OnInit, OnDestroy {

  products: Product[] = [];
  allProducts: Product[] = [];
  limit = 10;
  pagination = 10; // Define el número de productos que cargará por cada paginación
  isLoading = false;
  allProductsLoaded = false;
  role: string | null = null;
  searchTerm: string = ''; // Texto de búsqueda
  menuVisibleIndex: number | null = null; // Controlador del menú desplegable
  actualUser: User | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private _apiService: ApiService,
    private _authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
  ) { }


  /**
 *  - Se realiza la carga inicial de datos llamando a 'initialLoad()'.
 *  - Se obtiene el usuario actual mediante el servicio de autenticación.
 *  - Se verifica si el correo electrónico del usuario pertenece al dominio '@sdi.es' para asignar el rol de 'admin'.
 *    Si no pertenece a este dominio, se asigna el rol de 'user'.
 */
  ngOnInit(): void {
    this.initialLoad();
    this.actualUser = this._authService.getCurrentUser();

    // Si el usuario actual tiene un correo con el dominio @sdi.es, asignar rol de admin, de lo contrario será user
    this.role = (this.actualUser && /^[a-zA-Z0-9._%+-]+@sdi\.es$/.test(this.actualUser.email)) ? 'admin' : 'user';
  }


  /**
 * Carga inicial de productos. 
 * 
 *  - Se realiza una llamada al servicio API para obtener todos los productos.
 *  - Los productos obtenidos se almacenan en 'allProducts' para su uso posterior.
 *  - Se realiza una paginación inicial mostrando los primeros productos en la variable 'products'.
 */
  initialLoad() {
    this._apiService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.allProducts = res;
      this.products = res.slice(0, this.pagination);
    });
  }

  /**
 * Carga productos paginados desde la API. 
 * 
 *  - Se verifica si ya se están cargando productos o si ya se han cargado todos para evitar cargas múltiples innecesarias y mejorar el rendimiento.
 *  - Se realiza una llamada a la API para obtener una cantidad limitada de productos (limit).
 *  - Los productos obtenidos se filtran para evitar duplicados y se añaden a la lista de productos ya existente.
 *  - Si el número de productos recibidos es menor que el limite establecido, significa que no hay más productos por cargar.
 *  - Si no hay productos filtrados después de la carga y aún hay más productos por cargar, se llama a 'loadProducts()' de nuevo para seguir cargando.
 */
  loadProducts(): void {
    if (this.isLoading || this.allProductsLoaded) return;  // Evitar múltiples cargas o cargar más si ya tenemos todos los productos
    this.isLoading = true;

    this._apiService.getProductsPaginated(this.limit).pipe(takeUntil(this.destroy$)).subscribe(
      (res: Product[]) => {
        if (res.length > 0) {
          // Filtrar productos que ya existen en 'this.products' para evitar duplicados
          const newProducts = res.filter(newProduct =>
            !this.products.some(existingProduct => existingProduct.id === newProduct.id)
          );

          // Añadir solo los productos no repetidos
          this.products = [...this.products, ...newProducts];
        }

        // Si el número de productos cargados es menor que el límite, significa que ya no hay más productos disponibles
        if (res.length < this.limit) {
          this.allProductsLoaded = true;  // Marcar que ya hemos cargado todos los productos
        }

        this.isLoading = false;

        if (this.getFilteredProducts().length === 0 && !this.allProductsLoaded) {
          this.loadProducts();
        }

      },
      (error) => {
        console.error('Error al cargar productos', error);
        this.isLoading = false;
      }
    );
  }

  /**
 * Filtra los productos basándose en el texto de búsqueda ingresado por el usuario.
 * 
 *  - Si no hay un término de búsqueda, se devuelven todos los productos actualmente cargados en `this.products`.
 *  - Si hay un término de búsqueda, se filtran todos los productos cuyo título coincida parcial o completamente con el término de búsqueda,
 *    ignorando mayúsculas y minúsculas.
 * 
 * @returns Un array de productos que coinciden con el término de búsqueda o todos los productos si no hay búqsueda.
 */
  getFilteredProducts(): Product[] {
    if (!this.searchTerm) {
      return this.products; // Devuelve todos los productos si no hay término de búsqueda
    }
    return this.allProducts.filter(product =>
      product.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Mostrar/ocultar el menú de acciones
  toggleMenu(index: number): void {
    this.menuVisibleIndex = this.menuVisibleIndex === index ? null : index;
  }

  // Cerrar el menú de acciones
  closeMenu(): void {
    this.menuVisibleIndex = null;
  }

  // Comprueba si el admin tiene permisos para eliminar
  adminCanDelete(): boolean {
    return this.role === 'admin' && this.actualUser?.city === 'Madrid' && this.actualUser.country === 'España';
  }

  // Comprueba si el admin tiene permisos para crear
  adminCanCreate(): boolean {
    return this.role === 'admin' && this.actualUser?.city === 'Logroño' && this.actualUser.country === 'España';
  }

  // Proceso de confirmación de la eliminación del producto
  confirm(selectedProduct: Product) {
    this.confirmationService.confirm({
      header: `¿Eliminar ${selectedProduct.title}?`,
      message: 'Esta acción es irreversible.',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this._apiService.deleteProduct(selectedProduct.id).pipe(takeUntil(this.destroy$)).subscribe((res:any) => {
          if(res){
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Se ha borrado el producto correctamente.', life: 3000 });
            this.products = this.products.filter(product => product.id !== selectedProduct.id);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un error en el borrado.', life: 3000 });
          }
          this.closeMenu();
        });
      },

    });
  }

  // Navega hacia la creación del producto
  createProduct(){
    this.router.navigate(['/create-product']);
  }

  // Listener para el evento de scroll
  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000 && !this.isLoading && !this.allProductsLoaded) {
      this.limit = this.limit + this.pagination;
      this.loadProducts();
    }
  }

  // Evitamos fugas de memoria
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
