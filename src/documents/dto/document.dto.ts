import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../../entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Type of document',
    enum: DocumentType,
    example: DocumentType.DRIVING_LICENSE,
  })
  @IsEnum(DocumentType, { message: 'Invalid document type' })
  documentType: DocumentType;

  @ApiProperty({
    description: 'Document number/ID',
    example: 'DL-1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'Document number is required' })
  @MaxLength(100, { message: 'Document number cannot exceed 100 characters' })
  documentNumber: string;

  @ApiProperty({
    description: 'Document file URL (S3)',
    example: 'https://bucket.s3.amazonaws.com/documents/license.pdf',
  })
  @IsString()
  @IsNotEmpty({ message: 'Document URL is required' })
  @MaxLength(500, { message: 'Document URL cannot exceed 500 characters' })
  documentUrl: string;

  @ApiProperty({
    description: 'Document name/title',
    example: 'Driving License',
  })
  @IsString()
  @IsNotEmpty({ message: 'Document name is required' })
  @MaxLength(200, { message: 'Document name cannot exceed 200 characters' })
  documentName: string;

  @ApiProperty({
    description: 'Document description',
    example: 'Valid driving license for two-wheelers',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Document issue date',
    example: '2020-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Issue date must be a valid date' })
  issueDate?: string;

  @ApiProperty({
    description: 'Document expiry date',
    example: '2030-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid date' })
  expiryDate?: string;

  @ApiProperty({
    description: 'Vehicle ID (if document is vehicle-specific)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Invalid vehicle ID format' })
  vehicleId?: string;
}

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'Type of document',
    enum: DocumentType,
    example: DocumentType.DRIVING_LICENSE,
    required: false,
  })
  @IsOptional()
  @IsEnum(DocumentType, { message: 'Invalid document type' })
  documentType?: DocumentType;

  @ApiProperty({
    description: 'Document number/ID',
    example: 'DL-1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Document number cannot be empty' })
  @MaxLength(100, { message: 'Document number cannot exceed 100 characters' })
  documentNumber?: string;

  @ApiProperty({
    description: 'Document file URL (S3)',
    example: 'https://bucket.s3.amazonaws.com/documents/license.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Document URL cannot be empty' })
  @MaxLength(500, { message: 'Document URL cannot exceed 500 characters' })
  documentUrl?: string;

  @ApiProperty({
    description: 'Document name/title',
    example: 'Driving License',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Document name cannot be empty' })
  @MaxLength(200, { message: 'Document name cannot exceed 200 characters' })
  documentName?: string;

  @ApiProperty({
    description: 'Document description',
    example: 'Valid driving license for two-wheelers',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Document issue date',
    example: '2020-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Issue date must be a valid date' })
  issueDate?: string;

  @ApiProperty({
    description: 'Document expiry date',
    example: '2030-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid date' })
  expiryDate?: string;

  @ApiProperty({
    description: 'Vehicle ID (if document is vehicle-specific)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Invalid vehicle ID format' })
  vehicleId?: string;
}

export class DocumentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.DRIVING_LICENSE })
  documentType: DocumentType;

  @ApiProperty({ example: 'DL-1234567890' })
  documentNumber: string;

  @ApiProperty({
    example: 'https://bucket.s3.amazonaws.com/documents/license.pdf',
  })
  documentUrl: string;

  @ApiProperty({ example: 'Driving License' })
  documentName: string;

  @ApiProperty({
    example: 'Valid driving license for two-wheelers',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: '2020-01-15', nullable: true })
  issueDate: Date | null;

  @ApiProperty({ example: '2030-01-15', nullable: true })
  expiryDate: Date | null;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  vehicleId: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
