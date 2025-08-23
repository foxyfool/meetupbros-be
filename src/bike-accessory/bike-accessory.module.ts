import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikeAccessoryController } from './controller/bike-accessory.controller';
import { BikeAccessoryService } from './service/bike-accessory.service';
import { BikeAccessory } from '../entities/bike-accessory.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BikeAccessory, Vehicle, User])],
  controllers: [BikeAccessoryController],
  providers: [BikeAccessoryService],
  exports: [BikeAccessoryService],
})
export class BikeAccessoryModule {}
