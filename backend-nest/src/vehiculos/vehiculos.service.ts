import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from '../entities/vehiculo.entity';
import { Deuda } from '../entities/deuda.entity';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private vehiculosRepo: Repository<Vehiculo>,
    @InjectRepository(Deuda)
    private deudasRepo: Repository<Deuda>, // <--- Asegúrate de tener esto
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

  async findByPlaca(placa: string) {
  const vehiculo = await this.vehiculosRepo.findOne({ where: { placa } });
  if (!vehiculo) {
    return { success: true, registrado: false, placa };
  }
  return { 
    success: true, 
    registrado: true, 
    ...vehiculo 
  };
}
}