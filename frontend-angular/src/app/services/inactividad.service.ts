import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, timer, Subscription, fromEvent, merge, throttleTime } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactividadService {
  private timeoutId?: Subscription;
  private inactividad$ = new Subject<void>();
  
  // Tiempo en milisegundos (30 segundos para pruebas)
  private readonly TIEMPO_INACTIVIDAD = 1800000; 

  constructor(
    private router: Router, 
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    this.inicializarEscuchas();
  }

  private inicializarEscuchas() {
    // Detectar movimientos del mouse, clics y teclado
    // Usamos throttleTime para no saturar el procesador con cada pixel que se mueva el mouse
    const eventos$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'mousedown'),
      fromEvent(window, 'keypress'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'touchstart')
    ).pipe(throttleTime(1000));

    eventos$.subscribe(() => {
      this.reiniciarTiempo();
    });
  }

  iniciarVigilancia() {
    this.reiniciarTiempo();
  }

  detenerVigilancia() {
    this.timeoutId?.unsubscribe();
  }

  private reiniciarTiempo() {
    this.detenerVigilancia();

    // NgZone asegura que el timer no afecte el rendimiento de las animaciones
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = timer(this.TIEMPO_INACTIVIDAD).subscribe(() => {
        this.ngZone.run(() => {
          this.ejecutarLogout();
        });
      });
    });
  }

  private ejecutarLogout() {
    if (this.authService.estaLogueado()) {
      console.warn('Sesión cerrada por inactividad');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}