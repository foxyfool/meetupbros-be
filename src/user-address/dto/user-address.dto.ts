import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserAddressDto {
  @ApiProperty({
    description: 'Complete address',
    example: '123 Main Street, Apartment 4B',
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  address: string;

  @ApiProperty({
    description: 'City name',
    example: 'Mumbai',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city: string;

  @ApiProperty({
    description: 'District name',
    example: 'Mumbai Suburban',
  })
  @IsString()
  @IsNotEmpty({ message: 'District is required' })
  @MaxLength(100, { message: 'District cannot exceed 100 characters' })
  district: string;

  @ApiProperty({
    description: 'State name',
    example: 'Maharashtra',
  })
  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  state: string;

  @ApiProperty({
    description: 'PIN code',
    example: '400001',
  })
  @IsString()
  @IsNotEmpty({ message: 'PIN code is required' })
  @MaxLength(20, { message: 'PIN code cannot exceed 20 characters' })
  pinCode: string;

  @ApiProperty({
    description: 'Country name',
    example: 'India',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 19.076,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 72.8777,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;
}

export class UpdateUserAddressDto {
  @ApiProperty({
    description: 'Complete address',
    example: '123 Main Street, Apartment 4B',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Address cannot be empty' })
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  address?: string;

  @ApiProperty({
    description: 'City name',
    example: 'Mumbai',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'City cannot be empty' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string;

  @ApiProperty({
    description: 'District name',
    example: 'Mumbai Suburban',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'District cannot be empty' })
  @MaxLength(100, { message: 'District cannot exceed 100 characters' })
  district?: string;

  @ApiProperty({
    description: 'State name',
    example: 'Maharashtra',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'State cannot be empty' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  state?: string;

  @ApiProperty({
    description: 'PIN code',
    example: '400001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'PIN code cannot be empty' })
  @MaxLength(20, { message: 'PIN code cannot exceed 20 characters' })
  pinCode?: string;

  @ApiProperty({
    description: 'Country name',
    example: 'India',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Country cannot be empty' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 19.076,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 72.8777,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;
}

export class UserAddressResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: '123 Main Street, Apartment 4B' })
  address: string;

  @ApiProperty({ example: 'Mumbai' })
  city: string;

  @ApiProperty({ example: 'Mumbai Suburban' })
  district: string;

  @ApiProperty({ example: 'Maharashtra' })
  state: string;

  @ApiProperty({ example: '400001' })
  pinCode: string;

  @ApiProperty({ example: 'India' })
  country: string;

  @ApiProperty({ example: 19.076, nullable: true })
  latitude: number | null;

  @ApiProperty({ example: 72.8777, nullable: true })
  longitude: number | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
