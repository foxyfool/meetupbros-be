import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vehicle, VehicleType } from '../../entities/vehicle.entity';
import { User } from '../../entities/user.entity';
import { VehiclePhoto } from '../../entities/vehicle-photo.entity';
import { BikeAccessory } from '../../entities/bike-accessory.entity';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateVehicleWithDetailsDto,
  VehiclePhotoDto,
} from '../dto/vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(VehiclePhoto)
    private vehiclePhotoRepository: Repository<VehiclePhoto>,
    @InjectRepository(BikeAccessory)
    private bikeAccessoryRepository: Repository<BikeAccessory>,
    private dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if registration number is unique
    const existingVehicle = await this.vehicleRepository.findOne({
      where: {
        vehicleRegistrationNumber: createVehicleDto.vehicleRegistrationNumber,
      },
    });

    if (existingVehicle) {
      throw new ConflictException(
        'Vehicle with this registration number already exists',
      );
    }

    // Create vehicle
    const vehicle = this.vehicleRepository.create({
      userId,
      ...createVehicleDto,
      purchaseDate: createVehicleDto.purchaseDate
        ? new Date(createVehicleDto.purchaseDate)
        : null,
    });

    return this.vehicleRepository.save(vehicle);
  }

  async createWithDetails(
    userId: string,
    createVehicleWithDetailsDto: CreateVehicleWithDetailsDto,
  ): Promise<Vehicle> {
    // Use transaction for data integrity
    return this.dataSource.transaction(async (manager) => {
      // Verify user exists
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check registration number uniqueness
      const existingVehicle = await manager.findOne(Vehicle, {
        where: {
          vehicleRegistrationNumber:
            createVehicleWithDetailsDto.vehicleRegistrationNumber,
        },
      });

      if (existingVehicle) {
        throw new ConflictException(
          'Vehicle with this registration number already exists',
        );
      }

      // Create vehicle
      const vehicle = manager.create(Vehicle, {
        userId,
        vehicleType: createVehicleWithDetailsDto.vehicleType,
        vehicleRegistrationNumber:
          createVehicleWithDetailsDto.vehicleRegistrationNumber,
        make: createVehicleWithDetailsDto.make,
        model: createVehicleWithDetailsDto.model,
        year: createVehicleWithDetailsDto.year,
        color: createVehicleWithDetailsDto.color,
        nickname: createVehicleWithDetailsDto.nickname,
        modifications: createVehicleWithDetailsDto.modifications,
        performanceSpecs: createVehicleWithDetailsDto.performanceSpecs,
        purchaseDate: createVehicleWithDetailsDto.purchaseDate
          ? new Date(createVehicleWithDetailsDto.purchaseDate)
          : null,
        mileage: createVehicleWithDetailsDto.mileage,
      });

      const savedVehicle = await manager.save(Vehicle, vehicle);

      // Add vehicle photos if provided
      if (
        createVehicleWithDetailsDto.vehiclePhotos &&
        createVehicleWithDetailsDto.vehiclePhotos.length > 0
      ) {
        const photos = createVehicleWithDetailsDto.vehiclePhotos.map((photo) =>
          manager.create(VehiclePhoto, {
            vehicleId: savedVehicle.id,
            photoUrl: photo.photoUrl,
            caption: photo.caption,
            isMainPhoto: photo.isMainPhoto || false,
          }),
        );
        await manager.save(VehiclePhoto, photos);
      }

      // Add bike accessories if vehicle is two-wheeler and accessories provided
      if (
        createVehicleWithDetailsDto.vehicleType === VehicleType.TWO_WHEELER &&
        createVehicleWithDetailsDto.bikeAccessory
      ) {
        const accessory = manager.create(BikeAccessory, {
          vehicleId: savedVehicle.id,
          helmet: createVehicleWithDetailsDto.bikeAccessory.helmet || false,
          jacket: createVehicleWithDetailsDto.bikeAccessory.jacket || false,
          gloves: createVehicleWithDetailsDto.bikeAccessory.gloves || false,
          boots: createVehicleWithDetailsDto.bikeAccessory.boots || false,
          others: createVehicleWithDetailsDto.bikeAccessory.others,
        });
        await manager.save(BikeAccessory, accessory);
      }

      // Return vehicle with all relations
      return manager.findOne(Vehicle, {
        where: { id: savedVehicle.id },
        relations: ['vehiclePhotos', 'bikeAccessory'],
      });
    });
  }

  async findAllByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ vehicles: Vehicle[]; total: number }> {
    const [vehicles, total] = await this.vehicleRepository.findAndCount({
      where: { userId },
      relations: ['vehiclePhotos', 'bikeAccessory'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { vehicles, total };
  }

  async findById(id: string, userId?: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['user', 'vehiclePhotos', 'bikeAccessory'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // If userId is provided, ensure user owns the vehicle
    if (userId && vehicle.userId !== userId) {
      throw new ForbiddenException('You can only access your own vehicles');
    }

    return vehicle;
  }

  async findByRegistrationNumber(
    registrationNumber: string,
    userId?: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicleRegistrationNumber: registrationNumber },
      relations: ['user', 'vehiclePhotos', 'bikeAccessory'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // If userId is provided, ensure user owns the vehicle
    if (userId && vehicle.userId !== userId) {
      throw new ForbiddenException('You can only access your own vehicles');
    }

    return vehicle;
  }

  async update(
    id: string,
    userId: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id, userId }, // Ensure user owns the vehicle
    });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found or you do not have permission to update it',
      );
    }

    // Check registration number uniqueness if being updated
    if (
      updateVehicleDto.vehicleRegistrationNumber &&
      updateVehicleDto.vehicleRegistrationNumber !==
        vehicle.vehicleRegistrationNumber
    ) {
      const existingVehicle = await this.vehicleRepository.findOne({
        where: {
          vehicleRegistrationNumber: updateVehicleDto.vehicleRegistrationNumber,
        },
      });

      if (existingVehicle) {
        throw new ConflictException(
          'Vehicle with this registration number already exists',
        );
      }
    }

    // Update vehicle
    await this.vehicleRepository.update(id, {
      ...updateVehicleDto,
      purchaseDate: updateVehicleDto.purchaseDate
        ? new Date(updateVehicleDto.purchaseDate)
        : undefined,
    });

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id, userId }, // Ensure user owns the vehicle
    });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found or you do not have permission to delete it',
      );
    }

    await this.vehicleRepository.delete(id);
  }

  // ============ VEHICLE PHOTO CRUD METHODS ============

  async addPhotos(
    vehicleId: string,
    userId: string,
    photos: VehiclePhotoDto[],
  ): Promise<VehiclePhoto[]> {
    // Verify vehicle ownership
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found or you do not have permission to add photos',
      );
    }

    // If setting a new main photo, unset existing main photo
    const hasNewMainPhoto = photos.some((photo) => photo.isMainPhoto);
    if (hasNewMainPhoto) {
      await this.vehiclePhotoRepository.update(
        { vehicleId, isMainPhoto: true },
        { isMainPhoto: false },
      );
    }

    // Create new photos
    const vehiclePhotos = photos.map((photo) =>
      this.vehiclePhotoRepository.create({
        vehicleId,
        photoUrl: photo.photoUrl,
        caption: photo.caption,
        isMainPhoto: photo.isMainPhoto || false,
      }),
    );

    return this.vehiclePhotoRepository.save(vehiclePhotos);
  }

  async getVehiclePhotos(
    vehicleId: string,
    userId: string,
  ): Promise<VehiclePhoto[]> {
    // Verify vehicle ownership
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found or you do not have permission to view photos',
      );
    }

    return this.vehiclePhotoRepository.find({
      where: { vehicleId },
      order: { isMainPhoto: 'DESC', createdAt: 'ASC' },
    });
  }

  async getPhotoById(photoId: string, userId: string): Promise<VehiclePhoto> {
    const photo = await this.vehiclePhotoRepository.findOne({
      where: { id: photoId },
      relations: ['vehicle'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.vehicle.userId !== userId) {
      throw new ForbiddenException(
        'You can only access photos from your own vehicles',
      );
    }

    return photo;
  }

  async updatePhoto(
    photoId: string,
    userId: string,
    updateData: { photoUrl?: string; caption?: string; isMainPhoto?: boolean },
  ): Promise<VehiclePhoto> {
    const photo = await this.vehiclePhotoRepository.findOne({
      where: { id: photoId },
      relations: ['vehicle'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.vehicle.userId !== userId) {
      throw new ForbiddenException(
        'You can only update photos from your own vehicles',
      );
    }

    // If setting as main photo, unset other main photos for this vehicle
    if (updateData.isMainPhoto) {
      await this.vehiclePhotoRepository.update(
        { vehicleId: photo.vehicleId, isMainPhoto: true },
        { isMainPhoto: false },
      );
    }

    await this.vehiclePhotoRepository.update(photoId, updateData);

    return this.vehiclePhotoRepository.findOne({
      where: { id: photoId },
      relations: ['vehicle'],
    });
  }

  async setMainPhoto(photoId: string, userId: string): Promise<VehiclePhoto> {
    const photo = await this.vehiclePhotoRepository.findOne({
      where: { id: photoId },
      relations: ['vehicle'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.vehicle.userId !== userId) {
      throw new ForbiddenException(
        'You can only modify photos from your own vehicles',
      );
    }

    // Unset all main photos for this vehicle
    await this.vehiclePhotoRepository.update(
      { vehicleId: photo.vehicleId, isMainPhoto: true },
      { isMainPhoto: false },
    );

    // Set this photo as main
    await this.vehiclePhotoRepository.update(photoId, { isMainPhoto: true });

    return this.vehiclePhotoRepository.findOne({
      where: { id: photoId },
      relations: ['vehicle'],
    });
  }

  async deletePhoto(photoId: string, userId: string): Promise<void> {
    const photo = await this.vehiclePhotoRepository.findOne({
      where: { id: photoId },
      relations: ['vehicle'],
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.vehicle.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete photos from your own vehicles',
      );
    }

    await this.vehiclePhotoRepository.delete(photoId);
  }

  async deleteAllVehiclePhotos(
    vehicleId: string,
    userId: string,
  ): Promise<void> {
    // Verify vehicle ownership
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found or you do not have permission to delete photos',
      );
    }

    await this.vehiclePhotoRepository.delete({ vehicleId });
  }

  // ============ SEARCH AND STATS METHODS ============

  async searchVehicles(
    query: {
      make?: string;
      model?: string;
      year?: number;
      vehicleType?: VehicleType;
      color?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<{ vehicles: Vehicle[]; total: number }> {
    const queryBuilder = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.vehiclePhotos', 'photos')
      .leftJoinAndSelect('vehicle.user', 'user');

    if (query.make) {
      queryBuilder.andWhere('LOWER(vehicle.make) LIKE LOWER(:make)', {
        make: `%${query.make}%`,
      });
    }

    if (query.model) {
      queryBuilder.andWhere('LOWER(vehicle.model) LIKE LOWER(:model)', {
        model: `%${query.model}%`,
      });
    }

    if (query.year) {
      queryBuilder.andWhere('vehicle.year = :year', { year: query.year });
    }

    if (query.vehicleType) {
      queryBuilder.andWhere('vehicle.vehicleType = :vehicleType', {
        vehicleType: query.vehicleType,
      });
    }

    if (query.color) {
      queryBuilder.andWhere('LOWER(vehicle.color) LIKE LOWER(:color)', {
        color: `%${query.color}%`,
      });
    }

    queryBuilder
      .orderBy('vehicle.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [vehicles, total] = await queryBuilder.getManyAndCount();

    return { vehicles, total };
  }

  async getVehicleStats(userId: string): Promise<{
    totalVehicles: number;
    twoWheelers: number;
    fourWheelers: number;
    totalPhotos: number;
  }> {
    const [totalVehicles, twoWheelers, fourWheelers] = await Promise.all([
      this.vehicleRepository.count({ where: { userId } }),
      this.vehicleRepository.count({
        where: { userId, vehicleType: VehicleType.TWO_WHEELER },
      }),
      this.vehicleRepository.count({
        where: { userId, vehicleType: VehicleType.FOUR_WHEELER },
      }),
    ]);

    const totalPhotos = await this.vehiclePhotoRepository
      .createQueryBuilder('photo')
      .leftJoin('photo.vehicle', 'vehicle')
      .where('vehicle.userId = :userId', { userId })
      .getCount();

    return {
      totalVehicles,
      twoWheelers,
      fourWheelers,
      totalPhotos,
    };
  }
}
