import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@Entity('deudas')
export class Deuda {
  @PrimaryGeneratedColumn() // <--- Esta es la forma correcta
  id: number;

  @Column()
  placa: string;

  @Column()
  gestion: number;

  @Column('text')
  detalle: string;

  @Column('decimal')
  importe_final: number;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'placa' })
  vehiculo: Vehiculo;
}