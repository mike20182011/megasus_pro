import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryColumn()
  placa: string;

  @Column({ nullable: true })
  propietario: string;

  @Column({ nullable: true })
  poliza: string;

  @Column({ nullable: true })
  clase_vehiculo: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  tipo: string;

  @Column({ nullable: true })
  modelo: number;

  @Column({ nullable: true })
  servicio: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  radicatoria: string;
}