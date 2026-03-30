import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { VehiculosService } from './vehiculos.service';
import { lastValueFrom } from 'rxjs';
//import * as FormData from 'form-data';
import FormData = require('form-data');


@Controller('vehiculos')
export class VehiculosController {
  constructor(
    private readonly httpService: HttpService,
    private readonly vehiculosService: VehiculosService,
  ) {}

  @Post('escanear')
  @UseInterceptors(FileInterceptor('image'))
  async escanearPlaca(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    // 1. Preparar envío a la IA de Python (FastAPI)
    const formData = new FormData();
  formData.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
    });

    try {
      // 2. Llamada al servicio de detección de placas
      const respuestaPython = await lastValueFrom(
        this.httpService.post('http://localhost:8000/detect-plate', formData, {
          headers: formData.getHeaders(),
          timeout: 15000,
        }),
      );

      const { placa: placaDetectada, coords, success: iaSuccess } = respuestaPython.data;

      // Si la IA no detectó nada, respondemos temprano
      if (!placaDetectada || placaDetectada === 'No detectada' || !iaSuccess) {
        return {
          success: false,
          message: 'La IA no identificó una placa clara'
        };
      }

      // 3. CONSULTA MAESTRA A POSTGRESQL
      // Pasamos la placa y las coordenadas al servicio unificado
      // Este servicio ya retorna: registrado, es_robado, total_deuda, etc.
      const resultadoFinal = await this.vehiculosService.buscarDatosCompletos2(placaDetectada, coords);

      // 4. RESPUESTA FINAL AL FRONTEND
      // Retornamos directamente el objeto del servicio para no perder datos como 'es_robado'
      return {
        ...resultadoFinal,
        success: true 
      };

    } catch (error) {
      console.error('Error en el flujo de escaneo:', error.message);
      throw new BadRequestException({
        message: 'Error de comunicación con el servicio de IA',
        detail: error.message
      });
    }
  }

  // Búsqueda manual por placa (Desde el input de texto)
  @Get('buscar/:placa')
  async buscarPorPlaca(@Param('placa') placa: string) {
    // Usamos buscarDatosCompletos para que el buscador manual también active la alerta de robo
    return this.vehiculosService.buscarDatosCompletos(placa);
  }
}