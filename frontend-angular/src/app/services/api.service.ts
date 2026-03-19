import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/vehiculos/escanear';

  enviarImagen(imageBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageBlob, 'scan.jpg');
    return this.http.post(this.url, formData);
  }
}