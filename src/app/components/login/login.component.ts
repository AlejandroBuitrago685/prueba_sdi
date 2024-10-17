import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast'; 
import { MessageService } from 'primeng/api';  
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ToastModule
  ],
  providers: [AuthService, MessageService]
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginForm: FormGroup;
  hide = true;

  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _messageService: MessageService
  ) {
    this.loginForm = this._fb.group({ // Creación del formulario
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Comprobamos is podemos usar el storage y lo limpiamos
  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
    }
  }  

  // Proceso de comprobación de los datos introducidos para el posterior loguin
  onSubmit(): void {
    if (this.loginForm.valid) { 
      const { username, password } = this.loginForm.value;
      this._authService.login(username, password).pipe(takeUntil(this.destroy$)).subscribe(
        (user) => {
          if (user) { // En caso de iniciar sesión, redirigimos al dashboard
            this._router.navigate(['/dashboard']);
          } else {
            this._messageService.add({severity: 'error', summary: 'Error de Login', detail: 'Usuario o contraseña incorrectos'});
          }
        },
        (error) => {
          this._messageService.add({severity: 'error', summary: 'Error de Login', detail: 'Error en la autenticación: ' + error});
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
