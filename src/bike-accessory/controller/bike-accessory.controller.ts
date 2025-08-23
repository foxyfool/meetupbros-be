import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BikeAccessoryService } from '../service/bike-accessory.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CreateBikeAccessoryDto,
  UpdateBikeAccessoryDto,
  BikeAccessoryResponseDto,
} from '../dto/bike-accessory.dto';

@ApiTags('bike-accessories')
@Controller('bike-accessories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class BikeAccessoryController {
  constructor(private readonly bikeAccessoryService: BikeAccessoryService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create bike accessory for a vehicle' })
  @ApiBody({ type: CreateBikeAccessoryDto })
  @ApiResponse({
    status: 201,
    description: 'Bike accessory created successfully',
    type: BikeAccessoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Bike accessory already exists for this vehicle',
  })
  async create(
    @Request() req,
    @Body() createBikeAccessoryDto: CreateBikeAccessoryDto,
  ): Promise<BikeAccessoryResponseDto> {
    const bikeAccessory = await this.bikeAccessoryService.create(
      req.user.sub,
      createBikeAccessoryDto,
    );
    return this.mapToResponseDto(bikeAccessory);
  }

  @Post('create-or-update')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create or update bike accessory for a vehicle' })
  @ApiBody({ type: CreateBikeAccessoryDto })
  @ApiResponse({
    status: 200,
    description: 'Bike accessory created or updated successfully',
    type: BikeAccessoryResponseDto,
  })
  async createOrUpdate(
    @Request() req,
    @Body() createBikeAccessoryDto: CreateBikeAccessoryDto,
  ): Promise<BikeAccessoryResponseDto> {
    const bikeAccessory = await this.bikeAccessoryService.createOrUpdate(
      req.user.sub,
      createBikeAccessoryDto,
    );
    return this.mapToResponseDto(bikeAccessory);
  }

  @Get('my-accessories')
  @ApiOperation({ summary: 'Get all bike accessories for current user' })
  @ApiResponse({
    status: 200,
    description: 'Bike accessories retrieved successfully',
    type: [BikeAccessoryResponseDto],
  })
  async getMyAccessories(@Request() req): Promise<BikeAccessoryResponseDto[]> {
    const accessories = await this.bikeAccessoryService.findAllByUser(
      req.user.sub,
    );
    return accessories.map((accessory) => this.mapToResponseDto(accessory));
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get bike accessory for a specific vehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID' })
  @ApiResponse({
    status: 200,
    description: 'Bike accessory retrieved successfully',
    type: BikeAccessoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No bike accessory found for this vehicle',
  })
  async getByVehicle(
    @Request() req,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ): Promise<BikeAccessoryResponseDto | null> {
    const accessory = await this.bikeAccessoryService.findByVehicle(
      vehicleId,
      req.user.sub,
    );
    return accessory ? this.mapToResponseDto(accessory) : null;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get bike accessory statistics' })
  @ApiResponse({
    status: 200,
    description: 'Accessory statistics retrieved successfully',
  })
  async getAccessoryStats(@Request() req): Promise<{
    totalAccessories: number;
    vehiclesWithAccessories: number;
    safetyGearStats: {
      helmets: number;
      jackets: number;
      gloves: number;
      boots: number;
    };
  }> {
    return this.bikeAccessoryService.getAccessoryStats(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bike accessory by ID' })
  @ApiParam({ name: 'id', description: 'Bike accessory ID' })
  @ApiResponse({
    status: 200,
    description: 'Bike accessory retrieved successfully',
    type: BikeAccessoryResponseDto,
  })
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BikeAccessoryResponseDto> {
    const bikeAccessory = await this.bikeAccessoryService.findById(
      id,
      req.user.sub,
    );
    return this.mapToResponseDto(bikeAccessory);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bike accessory' })
  @ApiParam({ name: 'id', description: 'Bike accessory ID' })
  @ApiBody({ type: UpdateBikeAccessoryDto })
  @ApiResponse({
    status: 200,
    description: 'Bike accessory updated successfully',
    type: BikeAccessoryResponseDto,
  })
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBikeAccessoryDto: UpdateBikeAccessoryDto,
  ): Promise<BikeAccessoryResponseDto> {
    const bikeAccessory = await this.bikeAccessoryService.update(
      id,
      req.user.sub,
      updateBikeAccessoryDto,
    );
    return this.mapToResponseDto(bikeAccessory);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete bike accessory' })
  @ApiParam({ name: 'id', description: 'Bike accessory ID' })
  @ApiResponse({
    status: 204,
    description: 'Bike accessory deleted successfully',
  })
  async delete(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.bikeAccessoryService.delete(id, req.user.sub);
  }

  private mapToResponseDto(bikeAccessory: any): BikeAccessoryResponseDto {
    return {
      id: bikeAccessory.id,
      vehicleId: bikeAccessory.vehicleId,
      helmet: bikeAccessory.helmet,
      jacket: bikeAccessory.jacket,
      gloves: bikeAccessory.gloves,
      boots: bikeAccessory.boots,
      others: bikeAccessory.others,
      createdAt: bikeAccessory.createdAt,
      updatedAt: bikeAccessory.updatedAt,
    };
  }
}
