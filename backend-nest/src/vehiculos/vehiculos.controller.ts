import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { VehiculosService } from './vehiculos.service';
import { lastValueFrom } from 'rxjs';
import FormData = require('form-data');

@Controller('vehiculos')
export class VehiculosController {
  constructor(
    private readonly httpService: HttpService,
    private readonly vehiculosService: VehiculosService,
  ) {}

  @Post('escanear')
  @UseInterceptors(FileInterceptor('image')) // El Front debe enviar el archivo en el campo 'image'
  async escanearPlaca(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    // 1. Preparar la imagen para enviarla al microservicio de Python (FastAPI)
    const formData = new FormData();
    formData.append('file', file.buffer, { 
      filename: file.originalname,
      contentType: file.mimetype 
    });

    try {
      // 2. Llamada a la API de Python (IA)
      // Ajusta la URL si tu API de Python corre en otro puerto
      const respuestaPython = await lastValueFrom(
        this.httpService.post('http://localhost:8000/detect-plate', formData, {
          headers: formData.getHeaders(),
        }),
      );

      const placaDetectada = respuestaPython.data.placa;

      // Si la IA no detecta nada o devuelve el error controlado
      if (!placaDetectada || placaDetectada === 'No detectada') {
        return { 
          success: false, 
          message: 'La Inteligencia Artificial no pudo identificar una placa clara' 
        };
      }

      // 3. Consultar en PostgreSQL (Vehículo + Deudas)
      const datosCompletos = await this.vehiculosService.buscarDatosCompletos(placaDetectada);

      // Si la placa existe pero no está en nuestra DB
      if (!datosCompletos) {
        return {
          success: true,
          placa: placaDetectada,
          registrado: false,
          message: `La placa ${placaDetectada} no está registrada en el sistema Megasus`,
        };
      }

      // 4. Respuesta exitosa al Frontend
      return {
        success: true,
        registrado: true,
        ...datosCompletos, // Esto incluye los datos del vehiculo, el array de deudas y el total_deuda
      };

    } catch (error) {
      // Log para debugging en la consola de NestJS
      console.error('Error en el flujo de escaneo:', error.message);
      
      throw new BadRequestException({
        message: 'Error de comunicación con el servicio de IA o Base de Datos',
        detail: error.message
      });
    }
  }
}