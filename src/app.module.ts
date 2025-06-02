import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ResendModule } from './resend/resend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available throughout the application
    }),

    PrismaModule,

    AuthModule,

    UserModule,

    ResendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
