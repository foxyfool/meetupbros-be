import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './controller/document.controller';
import { DocumentService } from './service/document.service';
import { Document } from '../entities/document.entity';
import { User } from '../entities/user.entity';
import { Vehicle } from '../entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, User, Vehicle])],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
