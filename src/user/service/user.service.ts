import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        userAvatar: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude sensitive fields
        passwordHash: false,
        twoFactorSecret: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  // Alternative method
  async findByIdWithSensitiveData(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }
}
