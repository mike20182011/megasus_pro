import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    const usuario = await this.usuariosService.findOneByEmail(email);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Comparamos la contraseña enviada con el HASH de la base de datos
    const isMatch = await bcrypt.compare(pass, usuario.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Si todo está bien, generamos el JWT
    const payload = { sub: usuario.id, email: usuario.email, nombre: usuario.nombre_usuario };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: usuario.id,
        nombre: usuario.nombre_usuario,
        email: usuario.email
      }
    };
  }
}