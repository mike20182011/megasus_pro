import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = 'http://localhost:3000/historial-placas';

  constructor(private http: HttpClient) {}

  guardarRegistro(registro: any): Observable<any> {
    return this.http.post(this.apiUrl, registro);
  }
  
  obtenerHistorial(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}