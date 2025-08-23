import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('BikeAccessory')
export class BikeAccessory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  helmet: boolean;

  @Column({ type: 'boolean', default: false })
  jacket: boolean;

  @Column({ type: 'boolean', default: false })
  gloves: boolean;

  @Column({ type: 'boolean', default: false })
  boots: boolean;

  @Column({ type: 'text', nullable: true })
  others: string | null;

  @Column({ type: 'uuid', unique: true })
  vehicleId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'createdAt',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updatedAt',
  })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Vehicle, (vehicle) => vehicle.bikeAccessory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;
}
