import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BikeAccessory } from '../../entities/bike-accessory.entity';
import { Vehicle, VehicleType } from '../../entities/vehicle.entity';
import { User } from '../../entities/user.entity';
import {
  CreateBikeAccessoryDto,
  UpdateBikeAccessoryDto,
} from '../dto/bike-accessory.dto';

@Injectable()
export class BikeAccessoryService {
  constructor(
    @InjectRepository(BikeAccessory)
    private bikeAccessoryRepository: Repository<BikeAccessory>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    userId: string,
    createBikeAccessoryDto: CreateBikeAccessoryDto,
  ): Promise<BikeAccessory> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify vehicle exists and belongs to user
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: createBikeAccessoryDto.vehicleId, userId },
        relations: ['bikeAccessory'],
      });

      if (!vehicle) {
        throw new NotFoundException(
          'Vehicle not found or you do not have permission to add accessories to it',
        );
      }

      if (vehicle.vehicleType !== VehicleType.TWO_WHEELER) {
        throw new BadRequestException(
          'Bike accessories can only be added to two-wheelers',
        );
      }

      if (vehicle.bikeAccessory) {
        throw new ConflictException(
          'Bike accessory already exists for this vehicle. Use update instead.',
        );
      }

      // Create bike accessory
      const bikeAccessory = this.bikeAccessoryRepository.create({
        vehicleId: createBikeAccessoryDto.vehicleId,
        helmet: createBikeAccessoryDto.helmet || false,
        jacket: createBikeAccessoryDto.jacket || false,
        gloves: createBikeAccessoryDto.gloves || false,
        boots: createBikeAccessoryDto.boots || false,
        others: createBikeAccessoryDto.others,
      });

      return this.bikeAccessoryRepository.save(bikeAccessory);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.error('Unexpected error in create bike accessory:', error);
        throw new BadRequestException('Failed to create bike accessory');
      }
    }
  }

  async findAllByUser(userId: string): Promise<BikeAccessory[]> {
    try {
      return this.bikeAccessoryRepository
        .createQueryBuilder('accessory')
        .leftJoinAndSelect('accessory.vehicle', 'vehicle')
        .where('vehicle.userId = :userId', { userId })
        .orderBy('accessory.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      console.error('Error fetching bike accessories:', error);
      throw new BadRequestException('Failed to fetch bike accessories');
    }
  }

  async findByVehicle(
    vehicleId: string,
    userId: string,
  ): Promise<BikeAccessory | null> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: vehicleId, userId },
      });

      if (!vehicle) {
        throw new NotFoundException(
          'Vehicle not found or you do not have permission to view its accessories',
        );
      }

      return this.bikeAccessoryRepository.findOne({
        where: { vehicleId },
        relations: ['vehicle'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error fetching bike accessory by vehicle:', error);
      throw new BadRequestException('Failed to fetch bike accessory');
    }
  }

  async findById(id: string, userId: string): Promise<BikeAccessory> {
    try {
      const bikeAccessory = await this.bikeAccessoryRepository.findOne({
        where: { id },
        relations: ['vehicle'],
      });

      if (!bikeAccessory) {
        throw new NotFoundException('Bike accessory not found');
      }

      if (!bikeAccessory.vehicle || bikeAccessory.vehicle.userId !== userId) {
        throw new ForbiddenException(
          'You can only access accessories for your own vehicles',
        );
      }

      return bikeAccessory;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error fetching bike accessory by ID:', error);
      throw new BadRequestException('Failed to fetch bike accessory');
    }
  }

  async update(
    id: string,
    userId: string,
    updateBikeAccessoryDto: UpdateBikeAccessoryDto,
  ): Promise<BikeAccessory> {
    try {
      const bikeAccessory = await this.bikeAccessoryRepository.findOne({
        where: { id },
        relations: ['vehicle'],
      });

      if (!bikeAccessory) {
        throw new NotFoundException('Bike accessory not found');
      }

      if (!bikeAccessory.vehicle || bikeAccessory.vehicle.userId !== userId) {
        throw new ForbiddenException(
          'You can only update accessories for your own vehicles',
        );
      }

      await this.bikeAccessoryRepository.update(id, updateBikeAccessoryDto);

      return this.findById(id, userId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error updating bike accessory:', error);
      throw new BadRequestException('Failed to update bike accessory');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const bikeAccessory = await this.bikeAccessoryRepository.findOne({
        where: { id },
        relations: ['vehicle'],
      });

      if (!bikeAccessory) {
        throw new NotFoundException('Bike accessory not found');
      }

      if (!bikeAccessory.vehicle || bikeAccessory.vehicle.userId !== userId) {
        throw new ForbiddenException(
          'You can only delete accessories for your own vehicles',
        );
      }

      await this.bikeAccessoryRepository.delete(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error deleting bike accessory:', error);
      throw new BadRequestException('Failed to delete bike accessory');
    }
  }

  async createOrUpdate(
    userId: string,
    createBikeAccessoryDto: CreateBikeAccessoryDto,
  ): Promise<BikeAccessory> {
    try {
      const existingAccessory = await this.bikeAccessoryRepository.findOne({
        where: { vehicleId: createBikeAccessoryDto.vehicleId },
        relations: ['vehicle'],
      });

      if (existingAccessory) {
        if (existingAccessory.vehicle.userId !== userId) {
          throw new ForbiddenException(
            'You can only update accessories for your own vehicles',
          );
        }

        await this.bikeAccessoryRepository.update(existingAccessory.id, {
          helmet: createBikeAccessoryDto.helmet || false,
          jacket: createBikeAccessoryDto.jacket || false,
          gloves: createBikeAccessoryDto.gloves || false,
          boots: createBikeAccessoryDto.boots || false,
          others: createBikeAccessoryDto.others,
        });

        return this.findById(existingAccessory.id, userId);
      } else {
        return this.create(userId, createBikeAccessoryDto);
      }
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error creating or updating bike accessory:', error);
      throw new BadRequestException(
        'Failed to create or update bike accessory',
      );
    }
  }

  async getAccessoryStats(userId: string): Promise<{
    totalAccessories: number;
    vehiclesWithAccessories: number;
    safetyGearStats: {
      helmets: number;
      jackets: number;
      gloves: number;
      boots: number;
    };
  }> {
    try {
      const accessories = await this.findAllByUser(userId);

      const safetyGearStats = accessories.reduce(
        (stats, accessory) => ({
          helmets: stats.helmets + (accessory.helmet ? 1 : 0),
          jackets: stats.jackets + (accessory.jacket ? 1 : 0),
          gloves: stats.gloves + (accessory.gloves ? 1 : 0),
          boots: stats.boots + (accessory.boots ? 1 : 0),
        }),
        { helmets: 0, jackets: 0, gloves: 0, boots: 0 },
      );

      return {
        totalAccessories: accessories.length,
        vehiclesWithAccessories: accessories.length,
        safetyGearStats,
      };
    } catch (error) {
      console.error('Error fetching accessory statistics:', error);
      throw new BadRequestException('Failed to get accessory statistics');
    }
  }
}

// Try catch Done
