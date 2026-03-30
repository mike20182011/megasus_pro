import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from '../entities/vehiculo.entity';
import { Deuda } from '../entities/deuda.entity';
import { ReporteRobo } from 'src/entities/reporte-robo.entity';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private vehiculosRepo: Repository<Vehiculo>,
    @InjectRepository(Deuda)
    private deudasRepo: Repository<Deuda>, // <--- Asegúrate de tener esto
    @InjectRepository(ReporteRobo) // <-- Asegúrate de tener esta entidad creada e inyectada
  private reporteRoboRepo: Repository<ReporteRobo>,
  ) {}

  async buscarDatosCompletos(placa: string) {
    const vehiculo = await this.vehiculosRepo.findOne({ where: { placa } });
    if (!vehiculo) return null;

    const deudas = await this.deudasRepo.find({ where: { placa } });
    
    // Convertimos a número porque PostgreSQL devuelve los 'decimal' como string
    const total = deudas.reduce((acc, current) => acc + Number(current.importe_final), 0);

    return {
      ...vehiculo,
      deudas: deudas,
      total_deuda: total
    };
  }

  async findByPlaca(placa: string, coords?: any) { // Añadimos coords opcional
  const vehiculo = await this.vehiculosRepo.findOne({ where: { placa } });
  
  if (!vehiculo) {
    return { success: true, registrado: false, placa, coords }; // <-- Incluimos coords
  }
  
  return { 
    success: true, 
    registrado: true, 
    ...vehiculo,
    coords // <-- Incluimos coords
  };
}


async buscarPlaca(placa: string) {
  // 1. Buscamos los datos básicos del vehículo
  const vehiculo = await this.vehiculosRepo.findOne({ 
    where: { placa: placa } 
  });

  if (!vehiculo) {
    return { success: false, mensaje: 'Vehículo no encontrado' };
  }

  // 2. Buscamos si tiene un reporte de robo ACTIVO en la OTRA tabla
  // Aquí es donde usamos el campo 'estado' que pertenece a ReporteRobo
  const reporteRobo = await this.reporteRoboRepo.findOne({ 
    where: { 
      placa: placa, 
      estado: 'ACTIVO' // Este campo sí existe en ReporteRobo
    } 
  });

  // 3. Devolvemos todo unido para el Frontend
  return {
    ...vehiculo,
    es_robado: !!reporteRobo, // Si existe el reporte, esto será 'true'
    datos_robo: reporteRobo || null,
    success: true
  };
}


async buscarDatosCompletos2(placa: string, coords?: any) {
  // 1. Buscamos el vehículo básico
  const vehiculo = await this.vehiculosRepo.findOne({ where: { placa } });

  if (!vehiculo) {
    return { success: true, registrado: false, placa, coords, es_robado: false };
  }

  // 2. Buscamos las deudas
  const deudas = await this.deudasRepo.find({ where: { placa } });
  const total = deudas.reduce((acc, current) => acc + Number(current.importe_final), 0);

  // 3. Buscamos si es robado (¡Aquí estaba el truco!)
  const reporteRobo = await this.reporteRoboRepo.findOne({ 
    where: { 
      placa: placa, 
      estado: 'ACTIVO' 
    } 
  });

  // 4. Retornamos el objeto completo que el Front espera
  return {
    success: true,
    registrado: true,
    ...vehiculo,
    total_deuda: total,
    es_robado: !!reporteRobo, // <--- Esto activará la alerta roja
    datos_robo: reporteRobo || null,
    coords
  };
}

}