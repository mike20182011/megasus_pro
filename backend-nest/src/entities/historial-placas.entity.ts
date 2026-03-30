import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('historial_placas')
export class HistorialPlaca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  texto_placa: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_hora: Date;

  @Column({ length: 50, nullable: true })
  usuario_registro: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_deuda: number;

  @Column({ length: 100, nullable: true })
propietario: string;

@Column({ length: 50, nullable: true })
marca: string;

@Column({ type: 'integer', nullable: true })
modelo: number;
}