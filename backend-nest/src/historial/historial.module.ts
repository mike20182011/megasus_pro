import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { HistorialPlaca } from '../entities/historial-placas.entity'; // Ajusta la ruta a tu entidad

@Module({
  imports: [TypeOrmModule.forFeature([HistorialPlaca])],
  controllers: [HistorialController],
  providers: [HistorialService],
  //exports: [HistorialService] // Por si lo necesitas en otro lado
})
export class HistorialModule {}