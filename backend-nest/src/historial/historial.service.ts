import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialPlaca } from 'src/entities/historial-placas.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(HistorialPlaca)
    private historialRepository: Repository<HistorialPlaca>,
  ) {}

  async findAll(): Promise<any[]> {
  const resultado = await this.historialRepository.query(`
    SELECT 
      h.id,
      h.texto_placa,
      h.fecha_hora,
      h.usuario_registro,
      h.propietario,
      h.marca,
      h.modelo,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM reportes_robo rr 
          WHERE rr.placa = h.texto_placa AND rr.estado = 'ACTIVO'
        ) THEN TRUE 
        ELSE FALSE 
      END AS es_robado,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'gestion', d.gestion,
          'detalle', d.detalle,
          'importe_final', d.importe_final
        )) FROM deudas d WHERE d.placa = h.texto_placa), 
        '[]'
      ) AS lista_deudas,
      COALESCE(
        (SELECT SUM(d.importe_final) FROM deudas d WHERE d.placa = h.texto_placa), 
        0
      ) AS suma_total_deuda
    FROM historial_placas h
    GROUP BY h.id, h.texto_placa, h.fecha_hora, h.usuario_registro, h.propietario, h.marca, h.modelo
    ORDER BY h.fecha_hora DESC
  `);

  // --- LOG DE CONTROL ---
  console.log('REGISTRO 0 DEL BACKEND:', JSON.stringify(resultado[0], null, 2));
  
  return resultado;
}
  async crear(datos: any) {
    const nuevo = this.historialRepository.create({
      texto_placa: datos.texto_placa,
      fecha_hora: new Date(datos.fecha_hora),
      usuario_registro: datos.usuario_registro,
      total_deuda: datos.total_deuda,
      propietario: datos.propietario,
      marca: datos.marca,
      modelo: datos.modelo
    });

    return await this.historialRepository.save(nuevo);
  }
}