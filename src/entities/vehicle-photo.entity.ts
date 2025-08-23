import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('VehiclePhoto')
export class VehiclePhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'varchar', length: 500 })
  photoUrl: string; // S3 URL

  @Column({ type: 'varchar', length: 200, nullable: true })
  caption: string | null;

  @Column({ type: 'boolean', default: false })
  isMainPhoto: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'createdAt',
  })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehiclePhotos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;
}
