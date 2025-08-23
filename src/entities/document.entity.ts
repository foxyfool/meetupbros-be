import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';

export enum DocumentType {
  // Vehicle Documents
  REGISTRATION_CERTIFICATE = 'registration_certificate',
  INSURANCE = 'insurance',
  POLLUTION_CERTIFICATE = 'pollution_certificate',
  FITNESS_CERTIFICATE = 'fitness_certificate',
  PERMIT = 'permit',

  // Personal Documents
  DRIVING_LICENSE = 'driving_license',
  AADHAAR = 'aadhaar',

  // Other
  INVOICE = 'invoice',
  WARRANTY = 'warranty',
  SERVICE_RECORD = 'service_record',
  OTHER = 'other',
}

@Entity('Document')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 500 })
  documentUrl: string; // S3 URL

  @Column({ type: 'varchar', length: 200 })
  documentName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: true })
  issueDate: Date | null;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  vehicleId: string | null;

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
  @ManyToOne(() => User, (user) => user.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.documents, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle?: Vehicle;
}
