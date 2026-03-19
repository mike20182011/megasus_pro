import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule], // Quitamos RouterOutlet porque no lo necesitamos ahora
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private apiService = inject(ApiService);
  
  // Signals para manejar el estado de la UI
  escaneando = signal(false);
  resultado = signal<any>(null);
  error = signal<string | null>(null);
  intervalo: any;

  async iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', 
        // Cambiamos a formato horizontal (16:9 o 4:3)
        width: { ideal: 1280 }, 
        height: { ideal: 720 } 
      } 
    });
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = stream;
      this.error.set(null);
    }
  } catch (err) {
    this.error.set("No se pudo acceder a la cámara.");
  }
}

  toggleEscaneo() {
    if (!this.escaneando()) {
      this.iniciarCamara();
      this.escaneando.set(true);
      // Captura una foto cada 2.5 segundos
      this.intervalo = setInterval(() => this.capturarYEnviar(), 2500);
    } else {
      this.escaneando.set(false);
      clearInterval(this.intervalo);
      const stream = this.videoElement?.nativeElement.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  }

  capturarYEnviar() {
    const video = this.videoElement?.nativeElement;
    const canvas = this.canvasElement?.nativeElement;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          this.apiService.enviarImagen(blob).subscribe({
            next: (res) => {
              // Si la IA detectó caracteres (aunque no estén en la DB)
              if (res.success) {
                this.resultado.set(res); 
                // Al hacer .set(res), Angular refresca la pantalla automáticamente
                console.log("Procesando placa:", res.placa);
              } else {
                // Opcional: Si la IA no detecta nada, podrías limpiar el resultado previo tras unos segundos
                // this.resultado.set(null); 
              }
            },
            error: (err) => {
              console.error("Error en la comunicación con el servidor", err);
            }
          });
        }
      }, 'image/jpeg', 0.8);
    }
  }
}