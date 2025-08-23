import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserAddressModule } from './user-address/user-address.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DocumentModule } from './documents/dcoument.module';
import { BikeAccessoryModule } from './bike-accessory/bike-accessory.module';
import { ResendModule } from './resend/resend.module';

import { User } from './entities/user.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { UserAddress } from './entities/user-address.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Document } from './entities/document.entity';
import { VehiclePhoto } from './entities/vehicle-photo.entity';
import { BikeAccessory } from './entities/bike-accessory.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
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
        //synchronize: process.env.NODE_ENV === 'development',
        migrationsRun: false,
        migrations: ['dist/migrations/*.js'],
        //logging: process.env.NODE_ENV === 'development',
        ssl: {
          rejectUnauthorized: false, // Required for Supabase
        },
        extra: {
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
          max: 20,
        },
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UserModule,
    UserAddressModule,
    VehicleModule,
    DocumentModule,
    BikeAccessoryModule,
    ResendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
