import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/entities/user.entity';
import { EmailVerification } from './src/entities/email-verification.entity';
import { PasswordReset } from './src/entities/password-reset.entity';
import { BikeAccessory, UserAddress, Vehicle, VehiclePhoto } from 'src/entities';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // For Supabase
  },
  entities: [
    User,
    EmailVerification,
    PasswordReset,
    UserAddress,
    Vehicle,
    Document,
    VehiclePhoto,
    BikeAccessory,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  logging: true,
});
