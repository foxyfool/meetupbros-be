import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import {
  CreateUserDto,
  LoginDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  Enable2FADto,
  Verify2FADto,
  TokenResponseDto,
  UserResponseDto,
  MessageResponseDto,
} from '../dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<MessageResponseDto> {
    await this.authService.signup(createUserDto);
    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified',
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    const { token, user, requires2FA } = await this.authService.login(loginDto);
    return {
      token,
      user: this.mapUserToResponseDto(user),
      requires2FA,
    };
  }

  @Post('verify-2fa')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify two-factor authentication code' })
  @ApiBody({ type: Verify2FADto })
  @ApiResponse({
    status: 200,
    description: '2FA verification successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid 2FA code',
  })
  async verify2FA(@Body() dto: Verify2FADto): Promise<TokenResponseDto> {
    const { token, user } = await this.authService.verify2FA(dto);
    return {
      token,
      user: this.mapUserToResponseDto(user),
    };
  }

  @Post('enable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Enable or disable two-factor authentication' })
  @ApiBody({ type: Enable2FADto })
  @ApiResponse({
    status: 200,
    description: '2FA settings updated',
    type: MessageResponseDto,
  })
  async enable2FA(
    @Req() req,
    @Body() dto: Enable2FADto,
  ): Promise<MessageResponseDto> {
    await this.authService.enable2FA(req.user.sub, dto);
    return {
      message: dto.enable
        ? '2FA has been enabled for your account'
        : '2FA has been disabled for your account',
    };
  }

  @Get('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<MessageResponseDto> {
    await this.authService.verifyEmail(dto);
    return {
      message: 'Email has been verified successfully. You can now log in.',
    };
  }

  @Post('resend-verification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
    type: MessageResponseDto,
  })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<MessageResponseDto> {
    await this.authService.resendVerificationEmail(dto.email);
    return {
      message:
        'If your account exists and is not verified, a new verification email has been sent',
    };
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    type: MessageResponseDto,
  })
  async forgotPassword(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<MessageResponseDto> {
    await this.authService.requestPasswordReset(dto);
    return {
      message:
        'If an account with that email exists, a password reset link has been sent',
    };
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.resetPassword(dto);
    return { message: 'Password has been reset successfully' };
  }

  private mapUserToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
