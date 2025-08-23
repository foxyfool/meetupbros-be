import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './controller/vehicle.controller';
import { VehicleService } from './service/vehicle.service';
import { Vehicle } from '../entities/vehicle.entity';
import { User } from '../entities/user.entity';
import { VehiclePhoto } from '../entities/vehicle-photo.entity';
import { BikeAccessory } from '../entities/bike-accessory.entity';
import { Document } from '../entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      User,
      VehiclePhoto,
      BikeAccessory,
      Document,
    ]),
  ],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
