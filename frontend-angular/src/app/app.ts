import { Component, ViewEncapsulation } from '@angular/core'; // 1. Importamos ViewEncapsulation
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InactividadService } from './services/inactividad.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  /* 2. ESTO ES CLAVE: ViewEncapsulation.None hace que los estilos 
     de este componente se comporten como globales, eliminando 
     las "capas" invisibles que Angular pone por defecto.
  */
  encapsulation: ViewEncapsulation.None 
})
export class AppComponent {
  menuColapsado = true;

  constructor(
    private router: Router,
    private inactividadService: InactividadService
  ) {
    this.inactividadService.iniciarVigilancia();
  }

  toggleMenu() {
    this.menuColapsado = !this.menuColapsado;
  }

  esPaginaLogin(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }

  logout() {
    this.inactividadService.detenerVigilancia();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  navegarYPrincipal(ruta: string) {
    this.router.navigate([ruta]);
    this.menuColapsado = true; 
  }
}