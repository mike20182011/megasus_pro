import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuariosService } from './usuarios.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
    private usuariosService: UsuariosService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(@Body() regDto: any) {
    // Aquí recibimos: nombre, email y password
    const usuario = await this.usuariosService.crear(
      regDto.nombre, 
      regDto.email, 
      regDto.password
    );
    
    // Opcional: No devolver el hash en la respuesta por seguridad
    const { password_hash, ...resultado } = usuario;
    return resultado;
  }
  
}