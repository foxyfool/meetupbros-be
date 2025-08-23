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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentService } from '../service/document.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DocumentType } from '../../entities/document.entity';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentResponseDto,
} from '../dto/document.dto';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new document' })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
    type: DocumentResponseDto,
  })
  async create(
    @Request() req,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentService.create(
      req.user.sub,
      createDocumentDto,
    );
    return this.mapToResponseDto(document);
  }

  @Get('my-documents')
  @ApiOperation({ summary: 'Get current user documents (paginated)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  async getMyDocuments(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<{
    documents: DocumentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { documents, total } = await this.documentService.findAllByUser(
      req.user.sub,
      page,
      limit,
    );

    return {
      documents: documents.map((doc) => this.mapToResponseDto(doc)),
      total,
      page,
      limit,
    };
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get documents for a specific vehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle documents retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getVehicleDocuments(
    @Request() req,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ): Promise<DocumentResponseDto[]> {
    const documents = await this.documentService.findByVehicle(
      vehicleId,
      req.user.sub,
    );
    return documents.map((doc) => this.mapToResponseDto(doc));
  }

  @Get('type/:documentType')
  @ApiOperation({ summary: 'Get documents by type' })
  @ApiParam({
    name: 'documentType',
    enum: DocumentType,
    description: 'Document type',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents by type retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getDocumentsByType(
    @Request() req,
    @Param('documentType') documentType: DocumentType,
  ): Promise<DocumentResponseDto[]> {
    const documents = await this.documentService.findByType(
      req.user.sub,
      documentType,
    );
    return documents.map((doc) => this.mapToResponseDto(doc));
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get documents expiring soon' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Days ahead to check (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring documents retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getExpiringDocuments(
    @Request() req,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 30,
  ): Promise<DocumentResponseDto[]> {
    const documents = await this.documentService.findExpiringDocuments(
      req.user.sub,
      days,
    );
    return documents.map((doc) => this.mapToResponseDto(doc));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user document statistics' })
  @ApiResponse({
    status: 200,
    description: 'Document statistics retrieved successfully',
  })
  async getDocumentStats(@Request() req): Promise<{
    totalDocuments: number;
    personalDocuments: number;
    vehicleDocuments: number;
    expiringDocuments: number;
  }> {
    return this.documentService.getDocumentStats(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
    type: DocumentResponseDto,
  })
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentService.findById(id, req.user.sub);
    return this.mapToResponseDto(document);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
    type: DocumentResponseDto,
  })
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentService.update(
      id,
      req.user.sub,
      updateDocumentDto,
    );
    return this.mapToResponseDto(document);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 204,
    description: 'Document deleted successfully',
  })
  async delete(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.documentService.delete(id, req.user.sub);
  }

  private mapToResponseDto(document: any): DocumentResponseDto {
    return {
      id: document.id,
      documentType: document.documentType,
      documentNumber: document.documentNumber,
      documentUrl: document.documentUrl,
      documentName: document.documentName,
      description: document.description,
      issueDate: document.issueDate,
      expiryDate: document.expiryDate,
      userId: document.userId,
      vehicleId: document.vehicleId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
