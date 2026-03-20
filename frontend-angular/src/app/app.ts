import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. IMPORTANTE para que el input funcione
import { ApiService } from './services/api.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], // 2. AÑADIMOS FormsModule aquí
  templateUrl: './app.html',
  styleUrl: './app.css'
})


export class App {
  
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private apiService = inject(ApiService);
  cargando = false;
  escaneando = signal(false);
  resultado = signal<any>(null);
  error = signal<string | null>(null);
  intervalo: any;

  // 3. NUEVA FUNCIÓN: Para el input manual
  // Esta función se llama cada vez que escribes en el cuadro de texto
  buscarPlacaManual(placa: string) {
    const p = placa.trim().toUpperCase();
    
    // Solo buscamos en el servidor si hay al menos 3 caracteres
    if (p.length >= 3) {
      this.apiService.buscarPorTexto(p).subscribe({
        next: (res) => {
          // Actualizamos el signal de resultado. 
          // Si no existe en la DB, el servicio de NestJS ya nos devuelve 'registrado: false'
          this.resultado.set(res);
        },
        error: (err) => console.error("Error buscando placa manual:", err)
      });
    } else if (p.length === 0) {
      this.resultado.set(null); // Limpiamos si borran el input
    }
  }

  async iniciarCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
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
    // Bajamos a 1.5 segundos para mayor fluidez
    this.intervalo = setInterval(() => {
      if (!this.cargando) {
        this.capturarYEnviar();
      }
    }, 1500); 
  } else {
    this.escaneando.set(false);
    clearInterval(this.intervalo);
    // ... stop tracks
  }
}
  // 4. FUNCIÓN ACTUALIZADA: Captura desde cámara
capturarYEnviar() {
  const video = this.videoElement?.nativeElement;
  const canvas = this.canvasElement?.nativeElement;
  
  if (!video || !canvas || this.cargando) return;

  const context = canvas.getContext('2d');

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = 640; 
    canvas.height = 360; 
    
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        this.cargando = true;

        this.apiService.enviarImagen(blob).subscribe({
          next: (res) => {
            this.cargando = false;

            if (res.success) {
              // 1. Guardamos la placa anterior ANTES de actualizar
              const placaAnterior = this.resultado()?.placa;

              // 2. Actualizamos el Signal con las nuevas coordenadas y placa
              // Esto disparará el movimiento en el HTML inmediatamente
              this.resultado.set(res); 

              // 3. Solo logueamos si el TEXTO de la placa cambió
              if (res.placa !== placaAnterior) {
                console.log("🎯 Objetivo fijado:", res.placa);
                console.log("📍 Coordenadas:", res.coords);
              }
            } else {
              // Si falla la detección, quitamos las coordenadas para que el cuadro
              // no se quede "flotando" sobre la nada
              const actual = this.resultado();
              if (actual && actual.coords) {
                this.resultado.set({ ...actual, coords: null });
              }
            }
          },
          error: (err) => {
            this.cargando = false;
            console.error("❌ Error de enlace:", err);
          }
        });
      }
    }, 'image/jpeg', 0.6);
  }
}
}