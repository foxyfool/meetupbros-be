import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('EmailVerification')
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    unique: true,
    name: 'userId',
  })
  userId: string;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'expiresAt',
  })
  expiresAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.emailVerification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
