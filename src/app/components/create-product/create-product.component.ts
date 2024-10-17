import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ApiService } from '../../services/api/api.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    DropdownModule,
    ToastModule
  ],
  providers: [ApiService, MessageService, AuthService]
})
export class CreateProductComponent implements OnInit, OnDestroy{

  createProductForm: FormGroup;
  productPhoto: string | ArrayBuffer | null = null;
  categories: any = [];
  randomImageUrl: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _apiService: ApiService,
    private _messageService: MessageService,
  ) {
    this.createProductForm = this._fb.group({ // Creación del form
      title: ['', Validators.required],
      manufactureDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      image: ['', Validators.required]
    });
  }

  // Obtenemos las categorías disponibles y las mapeamos al formato del select
  ngOnInit(): void {
    this._apiService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.categories = [...new Set(res.map((product: any) => product.category))]
        .map((category: any) => ({
          name: category,
          code: category.toLowerCase().replace(/\s+/g, '-')
        }));
    });
  }

  // Gestión de la selección de imagen (Realmente no lo uso, ya que no hay servidor para subirla y la imagen se pasa como una url generada random de internet);
  onFileSelected(event: any): void {
    const file = event.target.files[0]; // Capturar el archivo seleccionado

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
        imagePreview.src = e.target.result;
        imagePreview.style.width = '130px';  // Establecemos el nuevo tamaño de la imagen
        imagePreview.style.height = '130px';

        // Actualizar el campo 'image' del formulario con el archivo seleccionado, para asi poder valisdar el formulario
        this.createProductForm.patchValue({
          image: e.target.result
        });
        this.createProductForm.get('image')?.updateValueAndValidity(); // Validar nuevamente el formulario para el desbloqueo del botón
      };

      reader.readAsDataURL(file); // Leer el archivo seleccionado como DataURL
    }
  }

  // Dispara el evento 'click' del input del file
  triggerFileInput(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.click(); 
  }

  // Realizamos la llamada a la API para realizar su creación
  onSubmit(): void {
    if (!this.createProductForm.valid) { // Validamos el form
      this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Compruebe los campos del formulario.' });
      return;
    }
    // Obtenemos la url de imagen aleatoria
    this._apiService.getRandomImageUrl().pipe(takeUntil(this.destroy$)).subscribe((url: string) => {
      this.randomImageUrl = url;
  
      const productData = this.prepareProductData();
  
      // Realizamos la creación mediante la API
      this._apiService.createProduct(productData).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.handleSuccess(),
        error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el producto.' })
      });
    });
  }
  
  // Creamos el objeto a mandar
  private prepareProductData(): any {
    const productData = this.createProductForm.value;
    productData.image = this.randomImageUrl;
    productData.category = this.createProductForm.get('category')?.value.name;
    return productData;
  }
  
  private handleSuccess(): void {
    this.createProductForm.reset(); // Limpiamos los campos del form
  
    // Restablecer la imagen al placeholder original y el tamaño
    const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
    imagePreview.src = 'assets/icons/placeholder.svg';
    imagePreview.style.width = '35px';
    imagePreview.style.height = '35px';
  
    this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado correctamente.' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
