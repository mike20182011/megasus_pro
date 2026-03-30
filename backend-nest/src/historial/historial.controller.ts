import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('historial-placas') // <-- Asegúrate que NO tenga '/' al inicio ni al final
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get() // Esto mapea a GET http://localhost:3000/historial-placas
  async findAll() {
    console.log('¡Petición recibida en el controlador!'); // Esto saldrá en tu terminal negra
    return await this.historialService.findAll();
  }

  @Post()
async crearRegistro(@Body() datos: any) {
  // 'datos' contendrá: texto_placa, fecha_hora, usuario_registro, total_deuda
  return this.historialService.crear(datos);
}
}