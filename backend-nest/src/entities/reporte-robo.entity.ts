import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vehiculo } from './vehiculo.entity'; // Asegúrate de que la ruta sea correcta

@Entity('reportes_robo')
export class ReporteRobo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  placa: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_reporte: Date;

  @Column({ type: 'text', nullable: true })
  descripcion_incidente: string;

  @Column({ length: 20, default: 'ACTIVO' })
  estado: string; // 'ACTIVO' o 'RECUPERADO'

  @Column({ type: 'timestamp', nullable: true })
  fecha_recuperacion: Date;

  @Column({ length: 100, nullable: true })
  autoridad_cargo: string;

  // Relación opcional por si quieres hacer Joins automáticos después
  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'placa' })
  vehiculo: Vehiculo;
}