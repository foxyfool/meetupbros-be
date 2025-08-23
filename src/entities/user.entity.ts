import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { EmailVerification } from './email-verification.entity';
import { PasswordReset } from './password-reset.entity';
import { UserAddress } from './user-address.entity';
import { Vehicle } from './vehicle.entity';
import { Document } from './document.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'fullName' })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'passwordHash' })
  passwordHash: string;

  @Column({ type: 'boolean', default: false, name: 'isEmailVerified' })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'twoFactorEnabled' })
  twoFactorEnabled: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'twoFactorSecret',
  })
  twoFactorSecret: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'userAvatar',
  })
  userAvatar: string | null;

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
  @OneToOne(() => PasswordReset, (passwordReset) => passwordReset.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  passwordReset?: PasswordReset;

  @OneToOne(
    () => EmailVerification,
    (emailVerification) => emailVerification.user,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  emailVerification?: EmailVerification;

  @OneToOne(() => UserAddress, (userAddress) => userAddress.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userAddress?: UserAddress;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user, {
    cascade: true,
  })
  vehicles?: Vehicle[];

  @OneToMany(() => Document, (document) => document.user, {
    cascade: true,
  })
  documents?: Document[];
}
