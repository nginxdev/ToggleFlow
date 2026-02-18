import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SegmentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createSegmentDto: CreateSegmentDto, projectId: string, userId: string) {
    const existing = await this.prisma.segment.findFirst({
      where: {
        projectId,
        key: createSegmentDto.key,
      },
    });

    if (existing) {
      throw new ConflictException('Segment key already exists in this project');
    }

    const segment = await this.prisma.segment.create({
      data: {
        ...createSegmentDto,
        projectId,
      },
    });

    await this.auditService.log({
      action: 'SEGMENT_CREATED',
      entity: 'Segment',
      entityId: segment.id,
      userId,
      payload: { name: segment.name, key: segment.key },
    });

    return segment;
  }

  async findAll(projectId: string) {
    return this.prisma.segment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${id} not found`);
    }

    return segment;
  }

  async update(id: string, updateSegmentDto: UpdateSegmentDto, userId: string) {
    const segment = await this.findOne(id);

    if (updateSegmentDto.key && updateSegmentDto.key !== segment.key) {
      const existing = await this.prisma.segment.findFirst({
        where: {
          projectId: segment.projectId,
          key: updateSegmentDto.key,
        },
      });

      if (existing) {
        throw new ConflictException('Segment key already exists in this project');
      }
    }

    const updated = await this.prisma.segment.update({
      where: { id },
      data: updateSegmentDto,
    });

    await this.auditService.log({
      action: 'SEGMENT_UPDATED',
      entity: 'Segment',
      entityId: id,
      userId,
      payload: updateSegmentDto,
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const segment = await this.findOne(id);

    await this.prisma.segment.delete({
      where: { id },
    });

    await this.auditService.log({
      action: 'SEGMENT_DELETED',
      entity: 'Segment',
      entityId: id,
      userId,
      payload: { name: segment.name, key: segment.key },
    });

    return { message: 'Segment deleted successfully' };
  }
}
