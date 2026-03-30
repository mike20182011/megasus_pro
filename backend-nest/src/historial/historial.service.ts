import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialPlaca } from 'src/entities/historial-placas.entity';
import { Repository } from 'typeorm';
//import { HistorialPlaca } from './entities/historial-placas.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(HistorialPlaca)
    private historialRepository: Repository<HistorialPlaca>,
  ) {}

  // Obtener todos los registros ordenados por el más reciente
  async findAll(): Promise<HistorialPlaca[]> {
    return await this.historialRepository.find({
      order: { fecha_hora: 'DESC' }
    });
  }

  async crear(datos: any) {
    // Creamos la instancia con los datos que vienen del Front
    const nuevo = this.historialRepository.create({
      texto_placa: datos.texto_placa,
      fecha_hora: new Date(datos.fecha_hora), // Convertimos el string ISO a Date de JS
      usuario_registro: datos.usuario_registro,
      total_deuda: datos.total_deuda,
      propietario: datos.propietario,
    marca: datos.marca,
    modelo: datos.modelo
    });

    return await this.historialRepository.save(nuevo);
  }
}