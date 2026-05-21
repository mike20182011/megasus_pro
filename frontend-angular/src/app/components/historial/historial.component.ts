import { Component, OnInit, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistorialService } from '../../services/historial.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Eye, Download, MessageCircle } from 'lucide-angular';


@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule,LucideAngularModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {

readonly Eye = Eye;
  readonly Download = Download;
  readonly MessageCircle = MessageCircle;
  
  mostrarModalWhatsapp = false;
telefonoWhatsapp = '591'; // Prefijo por defecto para Bolivia
itemParaWhatsApp: any = null;

  searchText: string = '';
itemSeleccionado: any = null;
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  idResaltado: number | null = null;
  registros: any[] = [];

  mostrarModalPDF = false;
  pdfUrl: SafeResourceUrl | null = null;

  historialCompleto: any[] = [];
  historialPaginado: any[] = [];
  cargando = true;

  paginaActual = 1;
  itemsPorPagina = 8; // Valor inicial
  totalPaginas = 1;

  constructor(
    private historialService: HistorialService,
    private cdr: ChangeDetectorRef,
    
  ) {}

  ngOnInit(): void {
    this.ajustarItemsPorPagina();
    this.cargarDatos();

    // CAPTURA DEL ID PARA EL PARPADEO AMARILLO
    this.route.queryParams.subscribe(params => {
      // Ajustamos para que acepte tanto 'nuevo' como 'nuevoId'
      const id = params['nuevoId'] || params['nuevo'];
      if (id) {
        this.idResaltado = parseInt(id, 10);
        console.log("Resaltando ID:", this.idResaltado);
        this.cdr.detectChanges();
        if (this.historialCompleto.length > 0) {
      this.paginaActual = 1;
      this.actualizarVista();
      this.cdr.detectChanges();
    }
        // Quitar el parpadeo después de 8 segundos para que no sea molesto
        setTimeout(() => {
      this.idResaltado = null;
      this.cdr.detectChanges();
    }, 10000);
      }
    });
  }

  // Detectamos cuando el usuario cambia el tamaño de la ventana (o rota el celular)
  @HostListener('window:resize', ['$event'])
onResize(event?: Event) { // <-- Añadimos event como opcional
  this.ajustarItemsPorPagina();
  this.actualizarVista();
}

  ajustarItemsPorPagina() {
    const altoPantalla = window.innerHeight;

    if (altoPantalla < 600) {
      this.itemsPorPagina = 4; // Celulares pequeños
    } else if (altoPantalla < 800) {
      this.itemsPorPagina = 6; // Tablets o laptops pequeñas
    } else if (altoPantalla < 1000) {
      this.itemsPorPagina = 8; // Pantallas estándar
    } else {
      this.itemsPorPagina = 12; // Monitores grandes
    }
    
    // Recalcular total de páginas si cambia el número de items
    if (this.historialCompleto.length > 0) {
      this.totalPaginas = Math.ceil(this.historialCompleto.length / this.itemsPorPagina);
    }
  }

cargarDatos() {
  this.cargando = true;
  this.historialService.obtenerHistorial().subscribe({
    next: (data) => {
      this.historialCompleto = data.map(item => ({
        ...item,
        es_robado: !!item.es_robado 
      }));

      // --- CORRECCIÓN AQUÍ ---
      // Si el ID que queremos resaltar existe, forzamos que estemos en la página 1
      // porque los nuevos registros siempre entran arriba.
      if (this.idResaltado) {
        this.paginaActual = 1;
        setTimeout(() => {
    this.cdr.detectChanges();
  }, 100);
      }
      
      this.totalPaginas = Math.ceil(this.historialCompleto.length / this.itemsPorPagina);
      this.actualizarVista();
      this.cargando = false;
      
      // Forzamos a Angular a que detecte que el ID ya está listo para el HTML
      this.cdr.detectChanges(); 

      // Lógica de voz...
      if (this.historialCompleto.length > 0 && this.historialCompleto[0].es_robado) {
        this.reproducirAlertaVoz(this.historialCompleto[0].texto_placa);
      }
    },
    error: () => { this.cargando = false; }
  });
}

// 3. Nueva función para la síntesis de voz
// En tu archivo historial.component.ts

reproducirAlertaVoz(placa: string) {
  if ('speechSynthesis' in window) {
    // 1. Detenemos cualquier audio o voz previa
    window.speechSynthesis.cancel();

    // 2. REPRODUCIR SONIDO DE ALERTA (.mp3)
    const audio = new Audio('sounds/alerta.mp3');
    audio.volume = 0.5; // Ajusta el volumen del 0 al 1 (opcional)
    
    audio.play().then(() => {
      // 3. REPRODUCIR VOZ (después de que inicie el sonido)
      const mensaje = new SpeechSynthesisUtterance(
        `Atención. Vehículo con reporte de robo. Placa: ${placa.split('').join(' ')}`
      );
      
      mensaje.lang = 'es-ES';
      mensaje.rate = 0.9;
      
      // Iniciamos la voz
      window.speechSynthesis.speak(mensaje);
    }).catch(error => {
      console.error("Error al reproducir el archivo mp3:", error);
      // Si el mp3 falla por alguna razón, que al menos suene la voz
      const mensaje = new SpeechSynthesisUtterance(`Atención. Placa robada: ${placa}`);
      window.speechSynthesis.speak(mensaje);
    });
  }
}
  actualizarVista() {
    this.totalPaginas = Math.ceil(this.historialCompleto.length / this.itemsPorPagina) || 1;
    
    // Si al cambiar el tamaño la página actual queda fuera de rango, volvemos a la 1
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = 1;
    }

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.historialPaginado = this.historialCompleto.slice(inicio, fin);
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarVista();
      this.cdr.detectChanges();
    }
  }

  // ... (Aquí mantienes tus métodos generarPDFTicket y generarReporteGlobal igual que antes)

generarPDFTicket(item: any) {
  // 1. Procesar datos de deudas (vienen del backend como array o string JSON)
  const deudas = typeof item.lista_deudas === 'string' 
    ? JSON.parse(item.lista_deudas) 
    : (item.lista_deudas || []);
  
  const sumaTotal = Number(item.suma_total_deuda || 0);
  const fecha = new Date(item.fecha_hora);

  // 2. Calcular altura dinámica para evitar desperdicio de papel
  // Base (95mm) + (Nro de deudas * 8mm) + Margen final (40mm)
  const alturaCalculada = 95 + (deudas.length * 8) + 40;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, alturaCalculada]
  });

  // --- CABECERA ---
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text("MEGASUS AI PRO", 40, 12, { align: 'center' });
  
  doc.setFontSize(7).setFont("helvetica", "normal").setTextColor(100);
  doc.text("SISTEMA INTEGRAL DE CONTROL VIAL", 40, 17, { align: 'center' });
  doc.text("----------------------------------------------------------", 40, 21, { align: 'center' });

  // --- SECCIÓN 1: PLACA ---
  doc.setTextColor(0);
  doc.setDrawColor(0).setLineWidth(0.5);
  doc.rect(10, 25, 60, 15);
  doc.setFontSize(20).setFont("helvetica", "bold");
  doc.text(item.texto_placa.toUpperCase(), 40, 35, { align: 'center' });

  // --- SECCIÓN 2: DATOS DEL VEHÍCULO ---
  let y = 48;
  doc.setFontSize(8).setFont("helvetica", "bold");
  doc.text("DATOS DEL MOTORIZADO:", 10, y);
  
  doc.setFont("helvetica", "normal").setFontSize(7);
  y += 4;
  doc.text(`MARCA: ${item.marca || 'N/A'}`, 10, y);
  doc.text(`MODELO: ${item.modelo || '---'}`, 45, y);
  y += 4;
  doc.text(`PROPIETARIO: ${item.propietario || 'S/R'}`, 10, y);

  // --- SECCIÓN 3: TABLA DE DEUDAS ---
  y += 8;
  doc.setFontSize(8).setFont("helvetica", "bold");
  doc.text("DETALLE DE DEUDAS PENDIENTES:", 10, y);
  
  y += 5;
  doc.setFontSize(7);
  doc.text("GEST.", 10, y);
  doc.text("DETALLE", 22, y);
  doc.text("IMPORTE", 70, y, { align: 'right' });
  
  y += 2;
  doc.text("----------------------------------------------------------", 40, y, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  deudas.forEach((d: any) => {
    y += 5;
    doc.text(String(d.gestion), 10, y);
    const detCorte = doc.splitTextToSize(d.detalle || 'Multa', 35);
    doc.text(detCorte, 22, y);
    doc.text(Number(d.importe_final).toFixed(2), 70, y, { align: 'right' });
    y += (detCorte.length > 1) ? (detCorte.length * 3) : 0;
  });

  // --- SECCIÓN 4: TOTAL ACUMULADO (RECUADRO ROJO) ---
  y += 10;
  doc.setFillColor(255, 235, 235); // Fondo rojo claro
  doc.rect(8, y, 64, 12, 'F'); 
  
  doc.setTextColor(200, 0, 0); // Texto Rojo
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text("TOTAL ACUMULADO:", 11, y + 7.5);
  
  doc.setFontSize(11);
  doc.text(`${sumaTotal.toFixed(2)} Bs.`, 69, y + 7.5, { align: 'right' });

  // --- PIE DE PÁGINA ---
  doc.setTextColor(0);
  y += 15;
  doc.setFontSize(7).setFont("helvetica", "normal");
  doc.text(`FECHA REGISTRO: ${fecha.toLocaleString()}`, 40, y, { align: 'center' });
  doc.setFont("helvetica", "bold");
  doc.text(`OPERADOR: ${item.usuario_registro || 'SISTEMA'}`, 10, y + 5);
  
  doc.setFont("helvetica", "italic").setTextColor(150);
  doc.text("Megasus AI - Documento de Control Interno", 40, y + 12, { align: 'center' });

  // 3. GUARDAR ARCHIVO
  const nombreArchivo = `Ticket_${item.texto_placa}_${item.id}.pdf`;
  doc.save(nombreArchivo);
}


  // MÉTODO PARA REPORTE GLOBAL DE LA PÁGINA ACTUAL

  generarReporteGlobal() {

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("Reporte de Historial - Megasus AI", 14, 20);

   

    const head = [['ID', 'Placa', 'Deuda (Bs)', 'Fecha', 'Operador']];

    const data = this.historialCompleto.map(item => [

      item.id,

      item.texto_placa,

      item.total_deuda.toFixed(2),

      new Date(item.fecha_hora).toLocaleString(),

      item.usuario_registro

    ]);


    autoTable(doc, {

      head: head,

      body: data,

      startY: 30,

      theme: 'grid',

      headStyles: { fillColor: [15, 52, 96] }

    });


    doc.save('Reporte_General_Megasus.pdf');

  }

verVistaPrevia(item: any) {
  this.itemSeleccionado = item;
  const deudas = typeof item.lista_deudas === 'string' ? JSON.parse(item.lista_deudas) : (item.lista_deudas || []);
  
  // CALCULAMOS LA ALTURA DINÁMICA: 
  // 90mm de cabecera/datos + espacio por cada deuda + 40mm de totales/pie
  const alturaCalculada = 95 + (deudas.length * 8) + 40;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, alturaCalculada] // El alto ahora es exacto
  });

  const fecha = new Date(item.fecha_hora);
  const sumaTotal = Number(item.suma_total_deuda || 0);

  // --- DISEÑO (CABECERA Y VEHÍCULO) ---
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text("MEGASUS AI PRO", 40, 12, { align: 'center' });
  
  doc.setDrawColor(0).rect(10, 18, 60, 12);
  doc.setFontSize(18).text(item.texto_placa.toUpperCase(), 40, 26, { align: 'center' });

  let y = 38;
  doc.setFontSize(8).setFont("helvetica", "bold");
  doc.text("DATOS DEL MOTORIZADO:", 10, y);
  doc.setFont("helvetica", "normal").setFontSize(7);
  y += 4;
  doc.text(`MARCA: ${item.marca || 'N/A'}`, 10, y);
  doc.text(`MODELO: ${item.modelo || '---'}`, 45, y);
  y += 4;
  doc.text(`PROPIETARIO: ${item.propietario || 'S/R'}`, 10, y);

  // --- TABLA DE DEUDAS ---
  y += 8;
  doc.setFontSize(8).setFont("helvetica", "bold");
  doc.text("DETALLE DE DEUDAS PENDIENTES:", 10, y);
  y += 5;
  doc.setFontSize(7).text("GEST.", 10, y);
  doc.text("DETALLE", 22, y);
  doc.text("IMPORTE", 70, y, { align: 'right' });
  y += 2;
  doc.text("----------------------------------------------------------", 40, y, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  deudas.forEach((d: any) => {
    y += 5;
    doc.text(String(d.gestion), 10, y);
    const detCorte = doc.splitTextToSize(d.detalle || 'Multa', 35);
    doc.text(detCorte, 22, y);
    doc.text(Number(d.importe_final).toFixed(2), 70, y, { align: 'right' });
    y += (detCorte.length > 1) ? (detCorte.length * 3) : 0;
  });

  // --- TOTAL ACUMULADO (RECUADRO ROJO CORREGIDO) ---
  y += 8;
  doc.setFillColor(255, 235, 235); // Fondo rojo claro
  doc.rect(8, y, 64, 12, 'F'); // Recuadro más ancho para que no se salga el "Bs."
  
  doc.setTextColor(200, 0, 0); // Texto Rojo
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text("TOTAL ACUMULADO:", 11, y + 7.5);
  
  doc.setFontSize(11);
  doc.text(`${sumaTotal.toFixed(2)} Bs.`, 69, y + 7.5, { align: 'right' });

  // --- PIE DE PÁGINA ---
  doc.setTextColor(0);
  y += 15;
  doc.setFontSize(7).setFont("helvetica", "normal");
  doc.text(`REGISTRO: ${fecha.toLocaleString()}`, 40, y, { align: 'center' });
  doc.text("Megasus AI - Documento de Control", 40, y + 4, { align: 'center' });

  // ENVIAR AL MODAL
  const dataUri = doc.output('datauristring');
  this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUri);
  this.mostrarModalPDF = true;
}

  cerrarModal() {
    this.mostrarModalPDF = false;
    this.pdfUrl = null;
  }

compartirWhatsApp(item: any) {
  this.itemParaWhatsApp = item;
  this.mostrarModalWhatsapp = true;
}

confirmarEnvioWhatsApp() {
  if (!this.telefonoWhatsapp || this.telefonoWhatsapp.length < 8) return;

  const item = this.itemParaWhatsApp;
  
  // 1. Procesar datos de deudas EXACTAMENTE como en el PDF
  const deudas = typeof item.lista_deudas === 'string' 
    ? JSON.parse(item.lista_deudas) 
    : (item.lista_deudas || []);
  
  const sumaTotal = Number(item.suma_total_deuda || 0);

  // --- CONSTRUCCIÓN DEL MENSAJE ---
  let mensaje = `┏━━━━━━━━━━━━━━━━━━┓%0A`;
  mensaje += `      *MEGASUS AI PRO*%0A`;
  mensaje += `┗━━━━━━━━━━━━━━━━━━┛%0A`;
  mensaje += `*SISTEMA DE CONTROL VIAL*%0A%0A`;

  mensaje += `*ID REGISTRO:* %23${item.id}%0A`;
  mensaje += `*PLACA:* ${item.texto_placa.toUpperCase()}%0A`;
  mensaje += `*PROPIETARIO:* ${item.propietario || 'S/R'}%0A`;
  mensaje += `------------------------------------------%0A`;

  mensaje += `*DETALLE DE DEUDAS:*%0A`;
  
  // 2. Recorrer deudas usando los campos del ticket (gestion, detalle, importe_final)
  if (deudas.length > 0) {
    deudas.forEach((d: any) => {
      const gestion = d.gestion || '---';
      const concepto = d.detalle || 'Impuesto';
      const monto = Number(d.importe_final || 0).toFixed(2);
      
      mensaje += `* ${gestion} | ${concepto}: ${monto} Bs.%0A`;
    });
  } else {
    mensaje += `* SIN DEUDAS PENDIENTES%0A`;
  }

  mensaje += `------------------------------------------%0A`;

  // 3. Estados y Totales
  const estadoIcono = item.es_robado ? '🚨 REPORTE ROBO' : (sumaTotal > 0 ? '❌ INFRACCIÓN' : '✅ AL DÍA');
  
  mensaje += `*TOTAL ACUMULADO:* ${sumaTotal.toFixed(2)} Bs.%0A`;
  mensaje += `*ESTADO:* ${estadoIcono}%0A%0A`;

  // 4. Pie de reporte
  const fechaFormateada = new Date(item.fecha_hora).toLocaleString('es-BO');
  mensaje += `*FECHA:* ${fechaFormateada}%0A`;
  mensaje += `*OPERADOR:* ${item.usuario_registro || 'SISTEMA'}%0A`;
  mensaje += `------------------------------------------%0A`;
  mensaje += `_Reporte generado por Megasus AI Protocol_`;

  // 5. Lanzar WhatsApp
  const url = `https://api.whatsapp.com/send?phone=${this.telefonoWhatsapp}&text=${mensaje}`;
  window.open(url, '_blank');

  this.mostrarModalWhatsapp = false;
}
  

get historialFiltrado() {
  let filtrados = this.historialCompleto;

  // Si hay algo escrito en el buscador
  if (this.searchText && this.searchText.trim() !== '') {
    const busqueda = this.searchText.toLowerCase().trim();
    
    filtrados = filtrados.filter(item => {
      const placa = (item.texto_placa || '').toLowerCase();
      const propietario = (item.propietario || '').toLowerCase();
      
      // Permitimos buscar por placa, por nombre de propietario
      // O incluso si el usuario escribe "robo" o "robado"
      const coincideTexto = placa.includes(busqueda) || propietario.includes(busqueda);
      const coincideEstado = (busqueda === 'robo' || busqueda === 'robado') && item.es_robado;

      return coincideTexto || coincideEstado;
    });
  }

  // Aplicar paginación sobre los resultados ya filtrados
  const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
  const fin = inicio + this.itemsPorPagina;
  
  return filtrados.slice(inicio, fin);
}

// Función para contar ocurrencias
get totalOcurrencias(): number {
  if (!this.searchText.trim()) return 0;
  
  const busqueda = this.searchText.toLowerCase().trim();
  
  return this.historialCompleto.filter(item => {
    const placa = (item.texto_placa || '').toLowerCase();
    const coincideEstado = (busqueda === 'robo' || busqueda === 'robado') && item.es_robado;
    
    return placa.includes(busqueda) || coincideEstado;
  }).length;
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


// NUEVA FUNCIÓN: Decide el estado exacto de la fila
obtenerEstiloFila(item: any): any {
  // 1. ¿Es el registro NUEVO? (No importa si es robado o limpio, debe ser amarillo)
  if (item.id == this.idResaltado) {
    console.log(`Aplicando estilo AMARILLO directo al ID: ${item.id}`);
    return {
      'background-color': 'rgba(250, 204, 21, 0.3)', // Fondo amarillo
      'border-left': '8px solid #facc15',            // Borde amarillo grueso
      'color': '#facc15',                            // Texto amarillento
      'font-weight': 'bold'
    };
  }
  
  // 2. ¿Es un registro ROBADO ANTIGUO?
  if (item.es_robado) {
    return {
      'background-color': 'rgba(127, 29, 29, 0.3)',  // Fondo rojo
      'border-left': '4px solid #ff4b2b'             // Borde rojo
    };
  }

  // 3. REGISTRO NORMAL
  return {
    'border-left': '4px solid transparent' // Mantiene la estructura para que no brinque la tabla
  };
}

}