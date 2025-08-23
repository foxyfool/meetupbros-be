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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserAddressService } from '../service/user-address.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
  UserAddressResponseDto,
} from '../dto/user-address.dto';

@ApiTags('user-address')
@Controller('user-address')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create user address' })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    type: UserAddressResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User already has an address',
  })
  async create(
    @Request() req,
    @Body() createUserAddressDto: CreateUserAddressDto,
  ): Promise<UserAddressResponseDto> {
    const address = await this.userAddressService.create(
      req.user.sub,
      createUserAddressDto,
    );
    return this.mapToResponseDto(address);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user address' })
  @ApiResponse({
    status: 200,
    description: 'Address retrieved successfully',
    type: UserAddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async getMyAddress(@Request() req): Promise<UserAddressResponseDto | null> {
    const address = await this.userAddressService.findByUserId(req.user.sub);
    return address ? this.mapToResponseDto(address) : null;
  }

  @Put()
  @ApiOperation({ summary: 'Update current user address' })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    type: UserAddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async update(
    @Request() req,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
  ): Promise<UserAddressResponseDto> {
    const address = await this.userAddressService.update(
      req.user.sub,
      updateUserAddressDto,
    );
    return this.mapToResponseDto(address);
  }

  @Put('create-or-update')
  @ApiOperation({ summary: 'Create or update user address' })
  @ApiResponse({
    status: 200,
    description: 'Address created or updated successfully',
    type: UserAddressResponseDto,
  })
  async createOrUpdate(
    @Request() req,
    @Body() createUserAddressDto: CreateUserAddressDto,
  ): Promise<UserAddressResponseDto> {
    const address = await this.userAddressService.createOrUpdate(
      req.user.sub,
      createUserAddressDto,
    );
    return this.mapToResponseDto(address);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete current user address' })
  @ApiResponse({
    status: 204,
    description: 'Address deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async delete(@Request() req): Promise<void> {
    await this.userAddressService.delete(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address retrieved successfully',
    type: UserAddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserAddressResponseDto> {
    const address = await this.userAddressService.findById(id);
    return this.mapToResponseDto(address);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get address by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Address retrieved successfully',
    type: UserAddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserAddressResponseDto | null> {
    const address = await this.userAddressService.findByUserId(userId);
    return address ? this.mapToResponseDto(address) : null;
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses (paginated)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    addresses: UserAddressResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { addresses, total } = await this.userAddressService.findAll(
      page,
      limit,
    );

    return {
      addresses: addresses.map((address) => this.mapToResponseDto(address)),
      total,
      page,
      limit,
    };
  }

  private mapToResponseDto(address: any): UserAddressResponseDto {
    return {
      id: address.id,
      userId: address.userId,
      address: address.address,
      city: address.city,
      district: address.district,
      state: address.state,
      pinCode: address.pinCode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
