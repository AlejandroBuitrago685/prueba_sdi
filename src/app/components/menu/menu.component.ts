import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true, 
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  
  isAdmin: boolean = false; // Variable de control de administración
  username: string | null = null; // Nombre de usuario

  constructor(
    private authService: AuthService,
    private router: Router) {}

  // Comprobación del tipo de usuario actual
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.username = currentUser.username;
      this.isAdmin = /^[a-zA-Z0-9._%+-]+@sdi\.es$/.test(currentUser.email);
    }
  }

  // Dependiendo del rol de usuario, navegamos hacia un listado u otro
  navigate(): void {
    if (this.isAdmin) {
      this.router.navigate(['/products']);
    } else {
      this.router.navigate(['/product-cart']);
    }
  }

  // Cierre de sesión y redirección
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
