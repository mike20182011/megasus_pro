import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // <-- Agrega esto
import { VehiculosService } from './vehiculos/vehiculos.service';
import { Vehiculo } from './entities/vehiculo.entity';
import { VehiculosController } from './vehiculos/vehiculos.controller';
import { Deuda } from './entities/deuda.entity';
import { Usuario } from './entities/usuario.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosService } from './usuarios/usuarios.service';
import { AuthController } from './usuarios/auth.controller';
import { AuthService } from './usuarios/auth.service';
import { HistorialPlaca } from './entities/historial-placas.entity';
import { HistorialController } from './historial/historial.controller';
import { HistorialService } from './historial/historial.service';
import { HistorialModule } from './historial/historial.module';
import { JwtStrategy } from './usuarios/jwt.strategy';
import { ReporteRobo } from './entities/reporte-robo.entity';


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
    TypeOrmModule.forFeature([Vehiculo, Deuda, Usuario,ReporteRobo]),
    JwtModule.register({
      secret: 'MI_SEMILLA_SECRETA_SUPER_SEGURA', // Cambia esto después
      signOptions: { expiresIn: '8h' }, // El token dura 8 horas
    }),
    HistorialModule
  ],
  controllers: [AppController, VehiculosController, AuthController],
  providers: [AppService,VehiculosService, UsuariosService,AuthService,JwtStrategy],
})
export class AppModule {}
