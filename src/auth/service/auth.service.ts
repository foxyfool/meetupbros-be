import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
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
import { User } from '@prisma/client';
import { ResendService } from '../../resend/resend.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
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
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        passwordHash,
      },
    });

    const verificationToken = uuidv4();

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      },
    });

    await this.resendService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return user;
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<User> {
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        token: dto.token,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    });

    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return user;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ token: string; user: User; requires2FA: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
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

      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: hashedCode },
      });

      await this.resendService.send2FACode(user.email, code);

      return {
        token: null,
        user: {
          ...user,
          passwordHash: undefined,
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
      },
      requires2FA: false,
    };
  }

  async enable2FA(userId: string, dto: Enable2FADto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Email must be verified before enabling 2FA',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: dto.enable },
    });
  }

  async verify2FA(
    dto: Verify2FADto,
  ): Promise<{ token: string; user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
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

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: null },
    });

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        ...user,
        passwordHash: undefined,
      },
    };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return;
    }

    const resetToken = uuidv4();

    await this.prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
      create: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await this.resendService.sendPasswordResetEmail(user.email, resetToken);

    console.log(`Reset token for ${user.email}: ${resetToken}`);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        token: dto.token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: { passwordHash },
    });

    await this.prisma.passwordReset.delete({
      where: { id: passwordReset.id },
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    const verificationToken = uuidv4();

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.resendService.sendVerificationEmail(
      user.email,
      verificationToken,
    );
  }
}
