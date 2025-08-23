import { Resend } from 'resend';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ResendOptions {
  apiKey: string;
  defaultFromEmail: string;
  appUrl: string;
}

@Injectable()
export class ResendService {
  private resend: Resend;
  private fromEmail: string;
  private appUrl: string;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not defined');
    }

    this.resend = new Resend(resendApiKey);

    this.fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'Acme <onboarding@resend.dev>',
    );
    this.appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.appUrl}/auth/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'MeetupBros - Verify your email address',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Verify your email address</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for registering! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #555; font-size: 14px;">This link will expire in 24 hours.</p>
        <p style="color: #555; font-size: 14px;">If you did not create an account, please ignore this email.</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} MeetupBros. All rights reserved.
        </div>
      </div>
    `,
    });
  }

  async send2FACode(email: string, code: string) {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'MeetupBros - two-factor authentication code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Two-Factor Authentication Code</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Your verification code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f4f4f4; padding: 15px; border-radius: 4px; display: inline-block;">
              ${code}
            </div>
          </div>
          <p style="color: #555; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #555; font-size: 14px; font-weight: bold;">If you did not request this code, please secure your account immediately.</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px;">
            &copy; ${new Date().getFullYear()} MeetupBros. All rights reserved.
          </div>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/auth/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password',
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #555; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #555; font-size: 14px; font-weight: bold;">If you didn't request a password reset, you can safely ignore this email.</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px;">
              &copy; ${new Date().getFullYear()} MeetupBros. All rights reserved.
            </div>
          </div>
        `,
    });
  }
}
