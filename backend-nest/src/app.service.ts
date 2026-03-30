import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  async onModuleInit() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    console.log('----------------------------------------------------');
    console.log('TU NUEVO HASH PARA LA DB (Contraseña: 123456):');
    console.log(hash);
    console.log('----------------------------------------------------');
  }

  getHello(): string {
    return 'Hello World!';
  }
}