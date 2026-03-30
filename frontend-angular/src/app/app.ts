import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InactividadService } from './services/inactividad.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  menuColapsado = false;
  constructor(
    private router: Router,
    private inactividadService: InactividadService
  ) {
    this.inactividadService.iniciarVigilancia();
  }
  toggleMenu() {
    this.menuColapsado = !this.menuColapsado;
  }
  // Función para ocultar el menú en el login
  esPaginaLogin(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }

  logout() {
    this.inactividadService.detenerVigilancia();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}