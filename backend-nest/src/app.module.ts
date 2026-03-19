import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // <-- Agrega esto
import { VehiculosService } from './vehiculos/vehiculos.service';
import { Vehiculo } from './entities/vehiculo.entity';
import { VehiculosController } from './vehiculos/vehiculos.controller';
import { Deuda } from './entities/deuda.entity';


@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456', // Tu contraseña de ayer
      database: 'uno_prueba1',
      autoLoadEntities: true, // Esto cargará automáticamente tus tablas
      synchronize: false,    // Importante: false para no borrar tus datos actuales
    }),
    TypeOrmModule.forFeature([Vehiculo, Deuda]),
  ],
  controllers: [AppController, VehiculosController],
  providers: [AppService,VehiculosService],
})
export class AppModule {}
