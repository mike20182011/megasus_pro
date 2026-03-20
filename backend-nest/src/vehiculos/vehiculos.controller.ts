import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param } from '@nestjs/common';
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
@UseInterceptors(FileInterceptor('image')) 
async escanearPlaca(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('No se recibió ninguna imagen');
  }

  console.log(`[Back] Imagen recibida: ${file.originalname}`);

  const formData = new FormData();
  formData.append('file', file.buffer, { 
    filename: file.originalname,
    contentType: file.mimetype 
  });

  try {
    console.log('[Back] Enviando a Python (FastAPI)...');

    const respuestaPython = await lastValueFrom(
      this.httpService.post('http://localhost:8000/detect-plate', formData, {
        headers: formData.getHeaders(),
        timeout: 15000,
      }),
    );

    // 1. EXTRAEMOS TODO LO QUE ENVÍA PYTHON (Incluyendo coords)
    const { placa: placaDetectada, coords, success: iaSuccess } = respuestaPython.data;
    
    console.log(`[Back] Python respondió: ${placaDetectada}`, coords);

    if (!placaDetectada || placaDetectada === 'No detectada' || !iaSuccess) {
      return { 
        success: false, 
        message: 'La IA no identificó una placa clara' 
      };
    }

    // 2. Consultar en PostgreSQL
    const datosCompletos = await this.vehiculosService.buscarDatosCompletos(placaDetectada);

    // 3. RETORNAR RESULTADO INCLUYENDO LAS COORDENADAS
    if (!datosCompletos) {
      return {
        success: true,
        placa: placaDetectada,
        coords: coords, // <--- ENVIAR COORDENADAS SI NO ESTÁ REGISTRADO
        registrado: false,
        message: `La placa ${placaDetectada} no está registrada`,
      };
    }

    return {
      success: true,
      registrado: true,
      ...datosCompletos,
      coords: coords, // <--- ENVIAR COORDENADAS SI ESTÁ REGISTRADO
    };

  } catch (error) {
    console.error('Error en el flujo de escaneo:', error.message);
    throw new BadRequestException({
      message: 'Error de comunicación con el servicio de IA',
      detail: error.message
    });
  }
}
  @Get('buscar/:placa')
async buscarPorPlaca(@Param('placa') placa: string) {
  return this.vehiculosService.findByPlaca(placa);
}
}