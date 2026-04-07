import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistorialService } from '../../services/historial.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {
  historialCompleto: any[] = [];
  historialPaginado: any[] = [];
  cargando = true;

  paginaActual = 1;
  itemsPorPagina = 8; // Valor inicial
  totalPaginas = 1;

  constructor(
    private historialService: HistorialService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ajustarItemsPorPagina(); // Calculamos cuántos caben al iniciar
    this.cargarDatos();
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
        this.historialCompleto = data;
        this.totalPaginas = Math.ceil(this.historialCompleto.length / this.itemsPorPagina);
        this.actualizarVista();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; }
    });
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

  // Aumentamos ligeramente el formato a 170mm de alto para que respire bien la información

  const doc = new jsPDF({

    orientation: 'portrait',

    unit: 'mm',

    format: [80, 170]

  });


  const deudaNumerica = Number(item.total_deuda) || 0;

  const fecha = new Date(item.fecha_hora);


  // --- CABECERA ---

  doc.setFont("helvetica", "bold");

  doc.setFontSize(14);

  doc.text("MEGASUS AI PRO", 40, 15, { align: 'center' });

 

  doc.setFontSize(7);

  doc.setFont("helvetica", "normal");

  doc.setTextColor(100);

  doc.text("SISTEMA INTEGRAL DE CONTROL VIAL", 40, 20, { align: 'center' });

  doc.text("----------------------------------------------------------", 40, 24, { align: 'center' });


  // --- SECCIÓN 1: IDENTIFICACIÓN PRINCIPAL ---

  doc.setTextColor(0);

  doc.setFontSize(8);

  doc.text(`ID REGISTRO: #${item.id}`, 10, 30);

 

  // Recuadro de la Placa

  doc.setDrawColor(0);

  doc.setLineWidth(0.5);

  doc.rect(10, 33, 60, 16);

  doc.setFontSize(20);

  doc.setFont("helvetica", "bold");

  doc.text(item.texto_placa.toUpperCase(), 40, 44, { align: 'center' });


  // --- SECCIÓN 2: DATOS DEL VEHÍCULO ---

  doc.setFontSize(8);

  doc.text("DETALLES DEL MOTORIZADO:", 10, 56);

 

  doc.setFont("helvetica", "normal");

  doc.text(`MARCA: ${item.marca || 'N/A'}`, 10, 61);

  doc.text(`MODELO: ${item.modelo || '---'}`, 10, 66);

 

  // Propietario con ajuste de texto por si el nombre es muy largo

  doc.setFont("helvetica", "bold");

  doc.text("PROPIETARIO:", 10, 73);

  doc.setFont("helvetica", "normal");

  const nombrePropietario = item.propietario || 'NO REGISTRADO';

  const lineasNombre = doc.splitTextToSize(nombrePropietario.toUpperCase(), 60);

  doc.text(lineasNombre, 10, 77);


  // Ajustamos la posición Y dependiendo de si el nombre ocupó una o dos líneas

  const ySiguiente = 77 + (lineasNombre.length * 4);


  // --- SECCIÓN 3: REGISTRO TEMPORAL ---

  doc.text("----------------------------------------------------------", 40, ySiguiente, { align: 'center' });

  doc.text(`FECHA: ${fecha.toLocaleDateString()}`, 10, ySiguiente + 6);

  doc.text(`HORA: ${fecha.toLocaleTimeString()}`, 10, ySiguiente + 11);


  // --- SECCIÓN 4: ESTADO DE CUENTA ---

  const yDeuda = ySiguiente + 20;

  const tieneDeuda = deudaNumerica > 0;

 

  // Fondo gris claro para la deuda (opcional, le da estilo)

  doc.setFillColor(245, 245, 245);

  doc.rect(10, yDeuda - 5, 60, 15, 'F');


  doc.setFont("helvetica", "bold");

  if (tieneDeuda) {

    doc.setTextColor(200, 0, 0); // Rojo

    doc.setFontSize(10);

    doc.text(`DEUDA TOTAL: ${deudaNumerica.toFixed(2)} Bs.`, 40, yDeuda + 2, { align: 'center' });

    doc.setFontSize(7);

    doc.text("ESTADO: INFRACCIÓN PENDIENTE", 40, yDeuda + 7, { align: 'center' });

  } else {

    doc.setTextColor(0, 120, 0); // Verde

    doc.setFontSize(10);

    doc.text("ESTADO: SIN DEUDA", 40, yDeuda + 2, { align: 'center' });

    doc.setFontSize(7);

    doc.text("VEHÍCULO SOLVENTE", 40, yDeuda + 7, { align: 'center' });

  }


  // --- PIE DE TICKET ---

  doc.setTextColor(0);

  doc.setFontSize(7);

  const yFooter = yDeuda + 20;

  doc.text("----------------------------------------------------------", 40, yFooter, { align: 'center' });

 

  doc.setFont("helvetica", "bold");

  doc.text(`OPERADOR: ${item.usuario_registro || 'SISTEMA'}`, 10, yFooter + 6);

 

  doc.setFont("helvetica", "italic");

  doc.setTextColor(150);

  doc.text("Reporte generado por Megasus AI Protocol", 40, yFooter + 15, { align: 'center' });

  doc.text("Documento de control interno", 40, yFooter + 19, { align: 'center' });


  // Guardar archivo

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


  
}