import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. IMPORTANTE para que el input funcione
import { ApiService } from '../../services/api.service';
import { HistorialService } from '../../services/historial.service';
//import { ApiService } from '../services/api.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], // 2. AÑADIMOS FormsModule aquí
  templateUrl: './escaneo.html',
  styleUrl: './escaneo.css'
})


export class EscaneoComponent {
  
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private apiService = inject(ApiService);
  private historialService = inject(HistorialService); // <--- Inyectamos el servicio de historial
  private cdr = inject(ChangeDetectorRef);
  
  cargando = false;
  escaneando = signal(false);
  resultado = signal<any>(null);
  error = signal<string | null>(null);
  intervalo: any;


  guardarEnHistorial() {
    const data = this.resultado();

    if (!data || !data.placa) {
      alert("No hay una placa detectada para guardar.");
      return;
    }

    const registro = {
      texto_placa: data.placa,
      fecha_hora: new Date().toISOString(),
      usuario_registro: 'Administrador', // O el usuario que prefieras
      total_deuda: data.total_deuda || 0,
      propietario: data.propietario || 'DESCONOCIDO',
    marca: data.marca || 'N/A',
    modelo: data.modelo || 0
    };

    this.historialService.guardarRegistro(registro).subscribe({
      next: (res) => {
        //console.log("✅ Guardado en historial:", res);
        alert(`Placa ${data.placa} guardada con éxito.`);
        // Opcional: limpiar el resultado tras guardar
        // this.resultado.set(null);
      },
      error: (err) => {
        //console.error("❌ Error al guardar:", err);
        alert("Error al conectar con el servidor de historial.");
      }
    });
  }

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

            // --- LOGS DE DEPURACIÓN ---
            console.log("📦 Respuesta completa del servidor:", res);
            console.log("🚨 ¿Viene marcado como robado?:", res.es_robado);
            // ---------------------------

            if (res.success) {
              const placaAnterior = this.resultado()?.placa;
              
              // Actualizamos el Signal
              this.resultado.set(res); 

              if (res.placa !== placaAnterior) {
                console.log("🎯 Objetivo fijado:", res.placa);
                // Si es robado, lanzamos un aviso extra en consola
                if (res.es_robado) {
                  console.error("⚠️ ATENCIÓN: PLACA CON REPORTE DE ROBO DETECTADA");
                }
              }
            } else {
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

cerrarAlerta() {
  const actual = this.resultado();
  if (actual) {
    // Apagamos la bandera de robado solo visualmente en este momento
    this.resultado.set({ ...actual, es_robado: false });
  }
}

}