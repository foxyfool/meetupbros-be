import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  CreateUserDto,
  Enable2FADto,
  LoginDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  Verify2FADto,
  VerifyEmailDto,
} from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity';
import { EmailVerification } from '../../entities/email-verification.entity';
import { PasswordReset } from '../../entities/password-reset.entity';
import { ResendService } from '../../resend/resend.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    private jwtService: JwtService,
    private resendService: ResendService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generate2faCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(createUserDto.password);

    const user = this.userRepository.create({
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    const verificationToken = uuidv4();

    const emailVerification = this.emailVerificationRepository.create({
      userId: savedUser.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });

    await this.emailVerificationRepository.save(emailVerification);

    await this.resendService.sendVerificationEmail(
      savedUser.email,
      verificationToken,
    );

    return savedUser;
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<User> {
    const verification = await this.emailVerificationRepository.findOne({
      where: {
        token: dto.token,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.userRepository.update(verification.userId, {
      isEmailVerified: true,
    });

    await this.emailVerificationRepository.delete(verification.id);

    const user = await this.userRepository.findOne({
      where: { id: verification.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        userAvatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ token: string; user: User; requires2FA: boolean }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        userAvatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValid = await this.comparePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    if (user.twoFactorEnabled) {
      const code = this.generate2faCode();

      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

      await this.userRepository.update(user.id, {
        twoFactorSecret: hashedCode,
      });

      await this.resendService.send2FACode(user.email, code);

      return {
        token: null,
        user: {
          ...user,
          passwordHash: undefined,
          twoFactorSecret: undefined,
        },
        requires2FA: true,
      };
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        ...user,
        passwordHash: undefined, // Remove password hash from response
        twoFactorSecret: undefined, // Remove 2FA secret from response
      },
      requires2FA: false,
    };
  }

  async enable2FA(userId: string, dto: Enable2FADto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Email must be verified before enabling 2FA',
      );
    }

    await this.userRepository.update(userId, {
      twoFactorEnabled: dto.enable,
    });
  }

  async verify2FA(dto: Verify2FADto): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        fullName: true,
        email: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        userAvatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    const hashedCode = crypto
      .createHash('sha256')
      .update(dto.code)
      .digest('hex');

    if (user.twoFactorSecret !== hashedCode) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.userRepository.update(user.id, {
      twoFactorSecret: null,
    });

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        ...user,
        twoFactorSecret: undefined, // Remove 2FA secret from response
      },
    };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      return;
    }

    const resetToken = uuidv4();

    const existingReset = await this.passwordResetRepository.findOne({
      where: { userId: user.id },
    });

    if (existingReset) {
      await this.passwordResetRepository.update(existingReset.id, {
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
    } else {
      const passwordReset = this.passwordResetRepository.create({
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
      await this.passwordResetRepository.save(passwordReset);
    }

    await this.resendService.sendPasswordResetEmail(user.email, resetToken);

    console.log(`Reset token for ${user.email}: ${resetToken}`);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: {
        token: dto.token,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.hashPassword(dto.newPassword);

    await this.userRepository.update(passwordReset.userId, {
      passwordHash,
    });

    await this.passwordResetRepository.delete(passwordReset.id);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return;
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.emailVerificationRepository.delete({
      userId: user.id,
    });

    const verificationToken = uuidv4();

    const emailVerification = this.emailVerificationRepository.create({
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await this.emailVerificationRepository.save(emailVerification);

    await this.resendService.sendVerificationEmail(
      user.email,
      verificationToken,
    );
  }
}
