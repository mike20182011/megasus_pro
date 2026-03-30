import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepo: Repository<Usuario>,
  ) {}

  // Cambiamos 'undefined' por 'null' para que coincida con lo que devuelve TypeORM
  async findOneByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { email } });
  }

  // También necesitaremos este para el Login por nombre de usuario
  async findOneByNombre(nombre_usuario: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { nombre_usuario } });
  }

  async crear(nombre: string, email: string, pass: string): Promise<Usuario> {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(pass, salt);

    const nuevoUsuario = this.usuariosRepo.create({
      nombre_usuario: nombre,
      email: email,
      password_hash: password_hash
    });

    return this.usuariosRepo.save(nuevoUsuario);
  }

}