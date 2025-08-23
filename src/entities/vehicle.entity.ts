import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Document } from './document.entity';
import { VehiclePhoto } from './vehicle-photo.entity';
import { BikeAccessory } from './bike-accessory.entity';

export enum VehicleType {
  TWO_WHEELER = 'two_wheeler',
  FOUR_WHEELER = 'four_wheeler',
}

@Entity('Vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicleType: VehicleType;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    name: 'vehicleRegistrationNumber',
  })
  vehicleRegistrationNumber: string;

  @Column({ type: 'varchar', length: 100 })
  make: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string | null;

  // Enthusiast specific details
  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string | null;

  @Column({ type: 'text', nullable: true })
  modifications: string | null;

  @Column({ type: 'text', nullable: true, name: 'performanceSpecs' })
  performanceSpecs: string | null;

  @Column({ type: 'date', nullable: true, name: 'purchaseDate' })
  purchaseDate: Date | null;

  @Column({ type: 'integer', nullable: true })
  mileage: number | null;

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
  @ManyToOne(() => User, (user) => user.vehicles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Document, (document) => document.vehicle, {
    cascade: true,
  })
  documents: Document[];

  @OneToMany(() => VehiclePhoto, (photo) => photo.vehicle, {
    cascade: true,
  })
  vehiclePhotos: VehiclePhoto[];

  @OneToOne(() => BikeAccessory, (accessory) => accessory.vehicle, {
    cascade: true,
  })
  bikeAccessory?: BikeAccessory;
}
