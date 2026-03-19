import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  // URL base de tu Backend en NestJS
  private baseUrl = 'http://localhost:3000/vehiculos';

  // FLUJO 1: Enviar imagen (Cámara -> NestJS -> Python -> DB)
  enviarImagen(imageBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageBlob, 'scan.jpg');
    // Enviamos a la ruta de escanear que ya tienes configurada
    return this.http.post(`${this.baseUrl}/escanear`, formData);
  }

  // FLUJO 2: Búsqueda manual (Input -> NestJS -> DB)
  buscarPorTexto(placa: string): Observable<any> {
    // Enviamos a la nueva ruta de buscar que creamos en el controlador
    return this.http.get(`${this.baseUrl}/buscar/${placa}`);
  }
}