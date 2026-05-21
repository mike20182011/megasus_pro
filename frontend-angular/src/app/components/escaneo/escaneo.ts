 import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms'; // 1. IMPORTANTE para que el input funcione

import { ApiService } from '../../services/api.service';

import { HistorialService } from '../../services/historial.service';

//import { ApiService } from '../services/api.service';

import { Router } from '@angular/router'; // Importar el Router
import { LucideAngularModule, Save } from 'lucide-angular';


@Component({

  selector: 'app-root',

  standalone: true,

  imports: [CommonModule, FormsModule,LucideAngularModule], // 2. AÑADIMOS FormsModule aquí

  templateUrl: './escaneo.html',

  styleUrl: './escaneo.css'

})



export class EscaneoComponent {

  readonly Save = Save;
 registroExitoso = false;
placaGuardada = '';

  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;

  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;


  private apiService = inject(ApiService);

  private historialService = inject(HistorialService); // <--- Inyectamos el servicio de historial

  private cdr = inject(ChangeDetectorRef);

  private router = inject(Router);

  cargando = false;

  escaneando = signal(false);

  resultado = signal<any>(null);

  error = signal<string | null>(null);

  intervalo: any;



  guardarEnHistorial() {
  const data = this.resultado();
  if (!data || !data.placa) return;

  const registro = {
    texto_placa: data.placa,
    fecha_hora: new Date().toISOString(),
    usuario_registro: 'Administrador',
    total_deuda: data.total_deuda || 0,
    propietario: data.propietario || 'DESCONOCIDO',
    marca: data.marca || 'N/A',
    modelo: data.modelo || 0
  };

  this.historialService.guardarRegistro(registro).subscribe({
    next: (res: any) => {
      // AQUÍ ESTÁ LA MAGIA:
      // Suponiendo que res.id es el ID del nuevo registro que creó tu API
      const nuevoId = res.id || res.insertId; 
      
      this.placaGuardada = data.placa;
      this.registroExitoso = true;
      this.emitirSonidoExito();

      // Redirigimos al historial pasando el ID como parámetro
      // Esto hará que el historial se recargue y detecte el ID resaltado
      this.router.navigate(['/historial'], { 
        queryParams: { nuevoId: nuevoId } 
      });
    },
    error: (err) => {
      console.error("Error al guardar:", err);
    }
  });
}

// Nueva función para navegar
irAlHistorial() {
  this.registroExitoso = false;
  this.router.navigate(['/historial']);
}

private emitirSonidoExito() {
  if ('speechSynthesis' in window) {
    const anuncio = new SpeechSynthesisUtterance("Registro completado");
    anuncio.lang = 'es-ES';
    anuncio.rate = 1.2;
    window.speechSynthesis.speak(anuncio);
  }
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
    const constraints = {
      video: {
        facingMode: 'environment', // Fuerza la cámara trasera
        width: { ideal: 1280 },    // Resolución ideal para lectura
        height: { ideal: 720 }
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = stream;
      // IMPORTANTE: Esperar a que el video cargue para obtener sus dimensiones reales
      this.videoElement.nativeElement.onloadedmetadata = () => {
        this.videoElement.nativeElement.play();
      };
    }
  } catch (err) {
    console.error("Error cámara:", err);
    alert("Revisa los permisos de la cámara.");
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
  
  if (!video || !canvas || video.readyState < 2) return;

  const context = canvas.getContext('2d');

  // Ajustamos el canvas al tamaño real de captura del móvil (reducido para velocidad)
  // Usar 640px es lo ideal para móviles porque mantiene nitidez sin saturar el 4G/5G
  const targetWidth = 640;
  const scale = targetWidth / video.videoWidth;
  canvas.width = targetWidth;
  canvas.height = video.videoHeight * scale;

  if (context) {
    // Dibujamos la imagen asegurando que ocupe todo el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob && this.escaneando()) {
        this.cargando = true;
        this.apiService.enviarImagen(blob).subscribe({
          next: (res) => {
            this.cargando = false;
            this.resultado.set(res);
          },
          error: () => this.cargando = false
        });
      }
    }, 'image/jpeg', 0.6); // Calidad 0.6 es perfecta para OCR móvil
  }
}


cerrarAlerta() {

  const actual = this.resultado();

  if (!actual) return;


  const registroParaGuardar = {

    texto_placa: actual.placa || actual.texto_placa,

    fecha_hora: new Date().toISOString(),

    total_deuda: actual.suma_total_deuda || 0,

    propietario: actual.propietario || 'S/R',

    marca: actual.marca || 'S/M',

    modelo: actual.modelo || 'S/M',

    es_robado: true // <--- ENVIAMOS LA MARCA DE ROBO

  };


  this.historialService.guardarRegistro(registroParaGuardar).subscribe({

    next: (res: any) => {

      window.speechSynthesis.cancel(); // Silenciamos la voz

      this.resultado.set(null); // Cerramos modal rojo

     

      // Redirigimos al historial pasando el ID para que resalte

      this.router.navigate(['/historial'], { queryParams: { nuevoId: res.id } });

    },

    error: (err) => console.error("Error al registrar:", err)

  });

}


reproducirAlertaVoz() {

  const mensaje = new SpeechSynthesisUtterance("Vehículo con reporte de robo detectado");

  mensaje.lang = 'es-ES'; // Configura el idioma a español

  mensaje.rate = 0.9;       // Velocidad normal

  window.speechSynthesis.speak(mensaje);

}



emitirAlertaVoz(mensaje: string) {

  // Verificamos si el navegador soporta síntesis de voz

  if ('speechSynthesis' in window) {

    const anuncio = new SpeechSynthesisUtterance(mensaje);

    anuncio.lang = 'es-ES'; // Configura el idioma a español

    anuncio.rate = 1.1;     // Velocidad un poco más rápida para urgencia

    anuncio.pitch = 1.0;    // Tono de voz normal

   

    window.speechSynthesis.speak(anuncio);

  } else {

    console.warn('Tu navegador no soporta alertas de voz.');

  }

}



obtenerEstilosRecuadro() {
  const res = this.resultado();
  if (!res || !res.coords || !this.videoElement || !this.canvasElement) return {};

  const video = this.videoElement.nativeElement;
  const canvas = this.canvasElement.nativeElement;

  // 1. Tamaño de la ventana del video en el navegador (PC o Móvil)
  const vw = video.clientWidth;
  const vh = video.clientHeight;

  // 2. Tamaño de la imagen que procesó la IA (El canvas)
  const iw = canvas.width;
  const ih = canvas.height;

  if (iw === 0 || ih === 0) return {};

  // 3. Lógica Object-Cover:
  const scale = Math.max(vw / iw, vh / ih);
  const offsetX = (vw - iw * scale) / 2;
  const offsetY = (vh - ih * scale) / 2;

  return {
    'left': (res.coords.x * scale + offsetX) + 'px',
    'top': (res.coords.y * scale + offsetY) + 'px',
    'width': (res.coords.w * scale) + 'px',
    'height': (res.coords.h * scale) + 'px',
    'position': 'absolute',
    'z-index': '50'
  };
}


} 