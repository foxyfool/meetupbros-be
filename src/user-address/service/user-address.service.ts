import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from '../../entities/user-address.entity';
import { User } from '../../entities/user.entity';
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from '../dto/user-address.dto';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    userId: string,
    createUserAddressDto: CreateUserAddressDto,
  ): Promise<UserAddress> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingAddress = await this.userAddressRepository.findOne({
      where: { userId },
    });

    if (existingAddress) {
      throw new ConflictException(
        'User already has an address. Use update instead.',
      );
    }

    const userAddress = this.userAddressRepository.create({
      userId,
      ...createUserAddressDto,
    });

    return this.userAddressRepository.save(userAddress);
  }

  async findByUserId(userId: string): Promise<UserAddress | null> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    return userAddress;
  }

  async findById(id: string): Promise<UserAddress> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!userAddress) {
      throw new NotFoundException('Address not found');
    }

    return userAddress;
  }

  async update(
    userId: string,
    updateUserAddressDto: UpdateUserAddressDto,
  ): Promise<UserAddress> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { userId },
    });

    if (!userAddress) {
      throw new NotFoundException('Address not found for this user');
    }

    await this.userAddressRepository.update(
      userAddress.id,
      updateUserAddressDto,
    );

    return this.findById(userAddress.id);
  }

  async delete(userId: string): Promise<void> {
    const userAddress = await this.userAddressRepository.findOne({
      where: { userId },
    });

    if (!userAddress) {
      throw new NotFoundException('Address not found for this user');
    }

    await this.userAddressRepository.delete(userAddress.id);
  }

  async createOrUpdate(
    userId: string,
    addressData: CreateUserAddressDto,
  ): Promise<UserAddress> {
    const existingAddress = await this.userAddressRepository.findOne({
      where: { userId },
    });

    if (existingAddress) {
      await this.userAddressRepository.update(existingAddress.id, addressData);
      return this.findById(existingAddress.id);
    } else {
      return this.create(userId, addressData);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ addresses: UserAddress[]; total: number }> {
    const [addresses, total] = await this.userAddressRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { addresses, total };
  }
}
