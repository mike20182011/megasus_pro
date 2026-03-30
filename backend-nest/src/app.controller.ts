import { Controller, Get } from '@nestjs/common'; // Asegúrate de que esté 'Get'
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Agrega esta ruta temporal para generar el hash real
  @Get('crear-admin-seguro')
  async crearAdmin() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    return {
      instrucciones: "Copia el nuevoHash y pégalo en el campo password_hash de tu tabla usuarios en pgAdmin",
      nuevoHash: hash
    };
  }
}