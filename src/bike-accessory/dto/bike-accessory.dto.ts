import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBikeAccessoryDto {
  @ApiProperty({
    description: 'Vehicle ID (must be a two-wheeler)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Invalid vehicle ID format' })
  @IsNotEmpty({ message: 'Vehicle ID is required' })
  vehicleId: string;

  @ApiProperty({
    description: 'Has helmet',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Helmet must be a boolean' })
  helmet?: boolean;

  @ApiProperty({
    description: 'Has jacket',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Jacket must be a boolean' })
  jacket?: boolean;

  @ApiProperty({
    description: 'Has gloves',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Gloves must be a boolean' })
  gloves?: boolean;

  @ApiProperty({
    description: 'Has boots',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Boots must be a boolean' })
  boots?: boolean;

  @ApiProperty({
    description: 'Other accessories',
    example: 'Tank bag, phone mount, LED lights',
    required: false,
  })
  @IsOptional()
  @IsString()
  others?: string;
}

export class UpdateBikeAccessoryDto {
  @ApiProperty({
    description: 'Has helmet',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Helmet must be a boolean' })
  helmet?: boolean;

  @ApiProperty({
    description: 'Has jacket',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Jacket must be a boolean' })
  jacket?: boolean;

  @ApiProperty({
    description: 'Has gloves',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Gloves must be a boolean' })
  gloves?: boolean;

  @ApiProperty({
    description: 'Has boots',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Boots must be a boolean' })
  boots?: boolean;

  @ApiProperty({
    description: 'Other accessories',
    example: 'Tank bag, phone mount, LED lights',
    required: false,
  })
  @IsOptional()
  @IsString()
  others?: string;
}

export class BikeAccessoryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  vehicleId: string;

  @ApiProperty({ example: true })
  helmet: boolean;

  @ApiProperty({ example: true })
  jacket: boolean;

  @ApiProperty({ example: false })
  gloves: boolean;

  @ApiProperty({ example: false })
  boots: boolean;

  @ApiProperty({ example: 'Tank bag, phone mount, LED lights', nullable: true })
  others: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
