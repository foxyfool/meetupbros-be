import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from '../../entities/document.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { CreateDocumentDto, UpdateDocumentDto } from '../dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    userId: string,
    createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If vehicleId is provided, verify vehicle exists and belongs to user
    if (createDocumentDto.vehicleId) {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: createDocumentDto.vehicleId, userId },
      });

      if (!vehicle) {
        throw new NotFoundException(
          'Vehicle not found or you do not have permission to add documents to it',
        );
      }
    }

    // Create document
    const document = this.documentRepository.create({
      userId,
      ...createDocumentDto,
      issueDate: createDocumentDto.issueDate
        ? new Date(createDocumentDto.issueDate)
        : null,
      expiryDate: createDocumentDto.expiryDate
        ? new Date(createDocumentDto.expiryDate)
        : null,
    });

    return this.documentRepository.save(document);
  }

  async findAllByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ documents: Document[]; total: number }> {
    const [documents, total] = await this.documentRepository.findAndCount({
      where: { userId },
      relations: ['user', 'vehicle'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { documents, total };
  }

  async findByVehicle(vehicleId: string, userId: string): Promise<Document[]> {
    // Verify vehicle belongs to user
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found or you do not have permission to view its documents',
      );
    }

    return this.documentRepository.find({
      where: { vehicleId, userId },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<Document[]> {
    return this.documentRepository.find({
      where: { userId, documentType },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['user', 'vehicle'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Ensure user owns the document
    if (document.userId !== userId) {
      throw new ForbiddenException('You can only access your own documents');
    }

    return document;
  }

  async update(
    id: string,
    userId: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id, userId }, // Ensure user owns the document
    });

    if (!document) {
      throw new NotFoundException(
        'Document not found or you do not have permission to update it',
      );
    }

    // If vehicleId is being updated, verify new vehicle belongs to user
    if (
      updateDocumentDto.vehicleId &&
      updateDocumentDto.vehicleId !== document.vehicleId
    ) {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: updateDocumentDto.vehicleId, userId },
      });

      if (!vehicle) {
        throw new NotFoundException(
          'Vehicle not found or you do not have permission to link documents to it',
        );
      }
    }

    // Update document
    await this.documentRepository.update(id, {
      ...updateDocumentDto,
      issueDate: updateDocumentDto.issueDate
        ? new Date(updateDocumentDto.issueDate)
        : undefined,
      expiryDate: updateDocumentDto.expiryDate
        ? new Date(updateDocumentDto.expiryDate)
        : undefined,
    });

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id, userId }, // Ensure user owns the document
    });

    if (!document) {
      throw new NotFoundException(
        'Document not found or you do not have permission to delete it',
      );
    }

    await this.documentRepository.delete(id);
  }

  async findExpiringDocuments(
    userId: string,
    daysAhead: number = 30,
  ): Promise<Document[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.userId = :userId', { userId })
      .andWhere('document.expiryDate IS NOT NULL')
      .andWhere('document.expiryDate <= :expiryDate', { expiryDate })
      .andWhere('document.expiryDate > :now', { now: new Date() })
      .leftJoinAndSelect('document.vehicle', 'vehicle')
      .orderBy('document.expiryDate', 'ASC')
      .getMany();
  }

  async getDocumentStats(userId: string): Promise<{
    totalDocuments: number;
    personalDocuments: number;
    vehicleDocuments: number;
    expiringDocuments: number;
  }> {
    const [totalDocuments, personalDocuments, vehicleDocuments] =
      await Promise.all([
        this.documentRepository.count({ where: { userId } }),
        this.documentRepository.count({ where: { userId, vehicleId: null } }),
        this.documentRepository.count({ where: { userId, vehicleId: {} as any} }),
      ]);

    const expiringDocuments = await this.findExpiringDocuments(userId);

    return {
      totalDocuments,
      personalDocuments,
      vehicleDocuments,
      expiringDocuments: expiringDocuments.length,
    };
  }
}
