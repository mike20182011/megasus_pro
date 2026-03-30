import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrae el token del encabezado 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // DEBE ser la misma semilla que usaste en el AppModule
      secretOrKey: 'MI_SEMILLA_SECRETA_SUPER_SEGURA', 
    });
  }

  // Si el token es válido, Passport añade lo que retornes aquí a request.user
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, nombre: payload.nombre };
  }
}