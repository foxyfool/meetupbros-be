import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { VehicleService } from '../service/vehicle.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { VehicleType } from '../../entities/vehicle.entity';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateVehicleWithDetailsDto,
  VehicleResponseDto,
  VehiclePhotoDto,
  VehiclePhotoResponseDto,
} from '../dto/vehicle.dto';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiBody({ type: CreateVehicleDto })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Vehicle with this registration number already exists',
  })
  async create(
    @Request() req,
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.create(
      req.user.sub,
      createVehicleDto,
    );
    return this.mapToResponseDto(vehicle);
  }

  @Post('with-details')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new vehicle with photos and accessories' })
  @ApiBody({ type: CreateVehicleWithDetailsDto })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully with all details',
    type: VehicleResponseDto,
  })
  async createWithDetails(
    @Request() req,
    @Body() createVehicleWithDetailsDto: CreateVehicleWithDetailsDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.createWithDetails(
      req.user.sub,
      createVehicleWithDetailsDto,
    );
    return this.mapToResponseDto(vehicle);
  }

  @Get('my-vehicles')
  @ApiOperation({ summary: 'Get current user vehicles (paginated)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
  })
  async getMyVehicles(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<{
    vehicles: VehicleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { vehicles, total } = await this.vehicleService.findAllByUser(
      req.user.sub,
      page,
      limit,
    );

    return {
      vehicles: vehicles.map((vehicle) => this.mapToResponseDto(vehicle)),
      total,
      page,
      limit,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user vehicle statistics' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle statistics retrieved successfully',
  })
  async getVehicleStats(@Request() req): Promise<{
    totalVehicles: number;
    twoWheelers: number;
    fourWheelers: number;
    totalPhotos: number;
  }> {
    return this.vehicleService.getVehicleStats(req.user.sub);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search vehicles across all users' })
  @ApiQuery({ name: 'make', required: false, description: 'Vehicle make' })
  @ApiQuery({ name: 'model', required: false, description: 'Vehicle model' })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Manufacturing year',
  })
  @ApiQuery({
    name: 'vehicleType',
    required: false,
    enum: VehicleType,
    description: 'Vehicle type',
  })
  @ApiQuery({ name: 'color', required: false, description: 'Vehicle color' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchVehicles(
    @Query('make') make?: string,
    @Query('model') model?: string,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('vehicleType') vehicleType?: VehicleType,
    @Query('color') color?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<{
    vehicles: VehicleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { vehicles, total } = await this.vehicleService.searchVehicles(
      { make, model, year, vehicleType, color },
      page,
      limit,
    );

    return {
      vehicles: vehicles.map((vehicle) => this.mapToResponseDto(vehicle)),
      total,
      page,
      limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.findById(id, req.user.sub);
    return this.mapToResponseDto(vehicle);
  }

  @Get('registration/:registrationNumber')
  @ApiOperation({ summary: 'Get vehicle by registration number' })
  @ApiParam({
    name: 'registrationNumber',
    description: 'Vehicle registration number',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
    type: VehicleResponseDto,
  })
  async findByRegistrationNumber(
    @Request() req,
    @Param('registrationNumber') registrationNumber: string,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.findByRegistrationNumber(
      registrationNumber,
      req.user.sub,
    );
    return this.mapToResponseDto(vehicle);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiBody({ type: UpdateVehicleDto })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: VehicleResponseDto,
  })
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.update(
      id,
      req.user.sub,
      updateVehicleDto,
    );
    return this.mapToResponseDto(vehicle);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({
    status: 204,
    description: 'Vehicle deleted successfully',
  })
  async delete(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.vehicleService.delete(id, req.user.sub);
  }

  @Post(':id/photos')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add photos to vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiBody({ type: [VehiclePhotoDto] })
  @ApiResponse({
    status: 201,
    description: 'Photos added successfully',
    type: [VehiclePhotoResponseDto],
  })
  async addPhotos(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() photos: VehiclePhotoDto[],
  ): Promise<VehiclePhotoResponseDto[]> {
    const vehiclePhotos = await this.vehicleService.addPhotos(
      id,
      req.user.sub,
      photos,
    );
    return vehiclePhotos.map((photo) => ({
      id: photo.id,
      vehicleId: photo.vehicleId,
      photoUrl: photo.photoUrl,
      caption: photo.caption,
      isMainPhoto: photo.isMainPhoto,
      createdAt: photo.createdAt,
    }));
  }

  @Get(':id/photos')
  @ApiOperation({ summary: 'Get all photos for a vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle photos retrieved successfully',
    type: [VehiclePhotoResponseDto],
  })
  async getVehiclePhotos(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehiclePhotoResponseDto[]> {
    const photos = await this.vehicleService.getVehiclePhotos(id, req.user.sub);
    return photos.map((photo) => ({
      id: photo.id,
      vehicleId: photo.vehicleId,
      photoUrl: photo.photoUrl,
      caption: photo.caption,
      isMainPhoto: photo.isMainPhoto,
      createdAt: photo.createdAt,
    }));
  }

  @Get('photos/:photoId')
  @ApiOperation({ summary: 'Get vehicle photo by ID' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({
    status: 200,
    description: 'Photo retrieved successfully',
    type: VehiclePhotoResponseDto,
  })
  async getPhotoById(
    @Request() req,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ): Promise<VehiclePhotoResponseDto> {
    const photo = await this.vehicleService.getPhotoById(photoId, req.user.sub);
    return {
      id: photo.id,
      vehicleId: photo.vehicleId,
      photoUrl: photo.photoUrl,
      caption: photo.caption,
      isMainPhoto: photo.isMainPhoto,
      createdAt: photo.createdAt,
    };
  }

  @Put('photos/:photoId')
  @ApiOperation({ summary: 'Update vehicle photo' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photoUrl: { type: 'string', description: 'New photo URL' },
        caption: { type: 'string', description: 'New caption' },
        isMainPhoto: { type: 'boolean', description: 'Set as main photo' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Photo updated successfully',
    type: VehiclePhotoResponseDto,
  })
  async updatePhoto(
    @Request() req,
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Body()
    updateData: { photoUrl?: string; caption?: string; isMainPhoto?: boolean },
  ): Promise<VehiclePhotoResponseDto> {
    const photo = await this.vehicleService.updatePhoto(
      photoId,
      req.user.sub,
      updateData,
    );
    return {
      id: photo.id,
      vehicleId: photo.vehicleId,
      photoUrl: photo.photoUrl,
      caption: photo.caption,
      isMainPhoto: photo.isMainPhoto,
      createdAt: photo.createdAt,
    };
  }

  @Put('photos/:photoId/set-main')
  @ApiOperation({ summary: 'Set photo as main photo for vehicle' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({
    status: 200,
    description: 'Main photo set successfully',
    type: VehiclePhotoResponseDto,
  })
  async setMainPhoto(
    @Request() req,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ): Promise<VehiclePhotoResponseDto> {
    const photo = await this.vehicleService.setMainPhoto(photoId, req.user.sub);
    return {
      id: photo.id,
      vehicleId: photo.vehicleId,
      photoUrl: photo.photoUrl,
      caption: photo.caption,
      isMainPhoto: photo.isMainPhoto,
      createdAt: photo.createdAt,
    };
  }

  @Delete('photos/:photoId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete vehicle photo' })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({
    status: 204,
    description: 'Photo deleted successfully',
  })
  async deletePhoto(
    @Request() req,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ): Promise<void> {
    await this.vehicleService.deletePhoto(photoId, req.user.sub);
  }

  @Delete(':id/photos')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete all photos for a vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  @ApiResponse({
    status: 204,
    description: 'All vehicle photos deleted successfully',
  })
  async deleteAllVehiclePhotos(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.vehicleService.deleteAllVehiclePhotos(id, req.user.sub);
  }

  private mapToResponseDto(vehicle: any): VehicleResponseDto {
    return {
      id: vehicle.id,
      userId: vehicle.userId,
      vehicleType: vehicle.vehicleType,
      vehicleRegistrationNumber: vehicle.vehicleRegistrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      nickname: vehicle.nickname,
      modifications: vehicle.modifications,
      performanceSpecs: vehicle.performanceSpecs,
      purchaseDate: vehicle.purchaseDate,
      mileage: vehicle.mileage,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      vehiclePhotos: vehicle.vehiclePhotos?.map((photo) => ({
        id: photo.id,
        vehicleId: photo.vehicleId,
        photoUrl: photo.photoUrl,
        caption: photo.caption,
        isMainPhoto: photo.isMainPhoto,
        createdAt: photo.createdAt,
      })),
      bikeAccessory: vehicle.bikeAccessory
        ? {
            id: vehicle.bikeAccessory.id,
            helmet: vehicle.bikeAccessory.helmet,
            jacket: vehicle.bikeAccessory.jacket,
            gloves: vehicle.bikeAccessory.gloves,
            boots: vehicle.bikeAccessory.boots,
            others: vehicle.bikeAccessory.others,
            createdAt: vehicle.bikeAccessory.createdAt,
            updatedAt: vehicle.bikeAccessory.updatedAt,
          }
        : undefined,
    };
  }
}
