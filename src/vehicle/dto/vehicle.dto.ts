import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VehicleType } from '../../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Type of vehicle',
    enum: VehicleType,
    example: VehicleType.TWO_WHEELER,
  })
  @IsEnum(VehicleType, { message: 'Invalid vehicle type' })
  vehicleType: VehicleType;

  @ApiProperty({
    description: 'Vehicle registration number',
    example: 'MH12AB1234',
  })
  @IsString()
  @IsNotEmpty({ message: 'Registration number is required' })
  @MaxLength(100, {
    message: 'Registration number cannot exceed 100 characters',
  })
  vehicleRegistrationNumber: string;

  @ApiProperty({
    description: 'Vehicle make/brand',
    example: 'Honda',
  })
  @IsString()
  @IsNotEmpty({ message: 'Make is required' })
  @MaxLength(100, { message: 'Make cannot exceed 100 characters' })
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'CBR 650R',
  })
  @IsString()
  @IsNotEmpty({ message: 'Model is required' })
  @MaxLength(100, { message: 'Model cannot exceed 100 characters' })
  model: string;

  @ApiProperty({
    description: 'Manufacturing year',
    example: 2023,
  })
  @IsInt({ message: 'Year must be a valid integer' })
  @Min(1900, { message: 'Year must be after 1900' })
  @Max(new Date().getFullYear() + 1, {
    message: 'Year cannot be in the future',
  })
  year: number;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'Pearl White',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Color cannot exceed 50 characters' })
  color?: string;

  @ApiProperty({
    description: 'Nickname for the vehicle',
    example: 'Beast',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nickname cannot exceed 100 characters' })
  nickname?: string;

  @ApiProperty({
    description: 'Vehicle modifications',
    example: 'Akrapovic exhaust, K&N air filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  modifications?: string;

  @ApiProperty({
    description: 'Performance specifications',
    example: 'Power: 95 HP, Torque: 64 Nm, Top Speed: 200 km/h',
    required: false,
  })
  @IsOptional()
  @IsString()
  performanceSpecs?: string;

  @ApiProperty({
    description: 'Purchase date',
    example: '2023-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Purchase date must be a valid date' })
  purchaseDate?: string;

  @ApiProperty({
    description: 'Current mileage in kilometers',
    example: 15000,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Mileage must be a valid integer' })
  @Min(0, { message: 'Mileage cannot be negative' })
  mileage?: number;
}

export class UpdateVehicleDto {
  @ApiProperty({
    description: 'Type of vehicle',
    enum: VehicleType,
    example: VehicleType.TWO_WHEELER,
    required: false,
  })
  @IsOptional()
  @IsEnum(VehicleType, { message: 'Invalid vehicle type' })
  vehicleType?: VehicleType;

  @ApiProperty({
    description: 'Vehicle registration number',
    example: 'MH12AB1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Registration number cannot be empty' })
  @MaxLength(100, {
    message: 'Registration number cannot exceed 100 characters',
  })
  vehicleRegistrationNumber?: string;

  @ApiProperty({
    description: 'Vehicle make/brand',
    example: 'Honda',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Make cannot be empty' })
  @MaxLength(100, { message: 'Make cannot exceed 100 characters' })
  make?: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'CBR 650R',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Model cannot be empty' })
  @MaxLength(100, { message: 'Model cannot exceed 100 characters' })
  model?: string;

  @ApiProperty({
    description: 'Manufacturing year',
    example: 2023,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Year must be a valid integer' })
  @Min(1900, { message: 'Year must be after 1900' })
  @Max(new Date().getFullYear() + 1, {
    message: 'Year cannot be in the future',
  })
  year?: number;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'Pearl White',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Color cannot exceed 50 characters' })
  color?: string;

  @ApiProperty({
    description: 'Nickname for the vehicle',
    example: 'Beast',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nickname cannot exceed 100 characters' })
  nickname?: string;

  @ApiProperty({
    description: 'Vehicle modifications',
    example: 'Akrapovic exhaust, K&N air filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  modifications?: string;

  @ApiProperty({
    description: 'Performance specifications',
    example: 'Power: 95 HP, Torque: 64 Nm, Top Speed: 200 km/h',
    required: false,
  })
  @IsOptional()
  @IsString()
  performanceSpecs?: string;

  @ApiProperty({
    description: 'Purchase date',
    example: '2023-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Purchase date must be a valid date' })
  purchaseDate?: string;

  @ApiProperty({
    description: 'Current mileage in kilometers',
    example: 15000,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Mileage must be a valid integer' })
  @Min(0, { message: 'Mileage cannot be negative' })
  mileage?: number;
}

export class VehiclePhotoDto {
  @ApiProperty({
    description: 'Photo URL from S3',
    example: 'https://bucket.s3.amazonaws.com/vehicle-photos/photo1.jpg',
  })
  @IsString()
  @IsNotEmpty({ message: 'Photo URL is required' })
  photoUrl: string;

  @ApiProperty({
    description: 'Photo caption',
    example: 'Front view',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Caption cannot exceed 200 characters' })
  caption?: string;

  @ApiProperty({
    description: 'Is this the main photo',
    example: false,
    required: false,
  })
  @IsOptional()
  isMainPhoto?: boolean;
}

export class BikeAccessoryDto {
  @ApiProperty({
    description: 'Has helmet',
    example: true,
    required: false,
  })
  @IsOptional()
  helmet?: boolean;

  @ApiProperty({
    description: 'Has jacket',
    example: true,
    required: false,
  })
  @IsOptional()
  jacket?: boolean;

  @ApiProperty({
    description: 'Has gloves',
    example: false,
    required: false,
  })
  @IsOptional()
  gloves?: boolean;

  @ApiProperty({
    description: 'Has boots',
    example: false,
    required: false,
  })
  @IsOptional()
  boots?: boolean;

  @ApiProperty({
    description: 'Other accessories',
    example: 'Tank bag, phone mount',
    required: false,
  })
  @IsOptional()
  @IsString()
  others?: string;
}

export class BikeAccessoryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: true })
  helmet: boolean;

  @ApiProperty({ example: true })
  jacket: boolean;

  @ApiProperty({ example: false })
  gloves: boolean;

  @ApiProperty({ example: false })
  boots: boolean;

  @ApiProperty({ example: 'Tank bag, phone mount', nullable: true })
  others: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class VehiclePhotoResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  vehicleId: string;

  @ApiProperty({
    example: 'https://bucket.s3.amazonaws.com/vehicle-photos/photo1.jpg',
  })
  photoUrl: string;

  @ApiProperty({ example: 'Front view', nullable: true })
  caption: string | null;

  @ApiProperty({ example: false })
  isMainPhoto: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class CreateVehicleWithDetailsDto extends CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle photos',
    type: [VehiclePhotoDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehiclePhotoDto)
  vehiclePhotos?: VehiclePhotoDto[];

  @ApiProperty({
    description: 'Bike accessories (only for two-wheelers)',
    type: BikeAccessoryDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BikeAccessoryDto)
  bikeAccessory?: BikeAccessoryDto;
}

export class VehicleResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.TWO_WHEELER })
  vehicleType: VehicleType;

  @ApiProperty({ example: 'MH12AB1234' })
  vehicleRegistrationNumber: string;

  @ApiProperty({ example: 'Honda' })
  make: string;

  @ApiProperty({ example: 'CBR 650R' })
  model: string;

  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 'Pearl White', nullable: true })
  color: string | null;

  @ApiProperty({ example: 'Beast', nullable: true })
  nickname: string | null;

  @ApiProperty({ example: 'Akrapovic exhaust, K&N air filter', nullable: true })
  modifications: string | null;

  @ApiProperty({ example: 'Power: 95 HP, Torque: 64 Nm', nullable: true })
  performanceSpecs: string | null;

  @ApiProperty({ example: '2023-06-15', nullable: true })
  purchaseDate: Date | null;

  @ApiProperty({ example: 15000, nullable: true })
  mileage: number | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [VehiclePhotoResponseDto], required: false })
  vehiclePhotos?: VehiclePhotoResponseDto[];

  @ApiProperty({ type: BikeAccessoryResponseDto, required: false })
  bikeAccessory?: BikeAccessoryResponseDto;
}
