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

  // LOG 1: Verificar que la imagen llegó al Back
  console.log(`[Back] Imagen recibida: ${file.originalname} (${file.size} bytes)`);

  const formData = new FormData();
  formData.append('file', file.buffer, { 
    filename: file.originalname,
    contentType: file.mimetype 
  });

  try {
    // LOG 2: Intentando conectar con Python
    console.log('[Back] Enviando a Python (FastAPI)...');

    const respuestaPython = await lastValueFrom(
      this.httpService.post('http://localhost:8000/detect-plate', formData, {
        headers: formData.getHeaders(),
        timeout: 15000, // <--- 15 segundos de espera máxima para la IA
      }),
    );

    const placaDetectada = respuestaPython.data.placa;
    
    // LOG 3: Ver que respondió la IA
    console.log(`[Back] Python respondió: ${placaDetectada}`);

    if (!placaDetectada || placaDetectada === 'No detectada') {
      return { 
        success: false, 
        message: 'La IA no identificó una placa clara' 
      };
    }

    // 3. Consultar en PostgreSQL
    const datosCompletos = await this.vehiculosService.buscarDatosCompletos(placaDetectada);

    if (!datosCompletos) {
      return {
        success: true,
        placa: placaDetectada,
        registrado: false,
        message: `La placa ${placaDetectada} no está registrada`,
      };
    }

    return {
      success: true,
      registrado: true,
      ...datosCompletos,
    };

  } catch (error) {
    // LOG DETALLADO PARA DIAGNÓSTICO
    if (error.code === 'ECONNABORTED') {
      console.error('Error: Python tardó demasiado (Timeout)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Error: El servidor de Python no está encendido en el puerto 8000');
    } else {
      console.error('Error en el flujo de escaneo:', error.message);
    }
    
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