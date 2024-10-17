import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersUrl = 'assets/users.json';  // Ruta al archivo JSON

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Obtener usuarios desde el archivo JSON
  getUsers(): Observable<any> {
    return this.http.get(this.usersUrl);
  }

  // Validar login
  login(username: string, password: string): Observable<any> {
    return this.getUsers().pipe(
      map((users: any[]) => {
        // Buscar el usuario con el username y password correctos
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
          // Simular autenticación guardando los datos del usuario en localStorage o sessionStorage
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          return user;
        } else {
          return null;
        }
      })
    );
  }

  // Obtener el usuario autenticado
  getCurrentUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(sessionStorage.getItem('currentUser')!);
    } else{
      return null;
    }
  }

  // Comprobamos si el usuario esta logueado
  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!sessionStorage.getItem('currentUser');
    } else{
      return false;
    }
  }

  // Cerrar sesión
  logout(): void {
    sessionStorage.removeItem('currentUser');
  }
}
