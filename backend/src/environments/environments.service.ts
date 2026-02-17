import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { DEFAULT_ENVIRONMENT_KEYS } from '../types/consts/environments';

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string) {
    return this.prisma.environment.findMany({
      where: { projectId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async create(createEnvironmentDto: CreateEnvironmentDto, projectId: string) {
    // Check if key already exists in this project
    const existing = await this.prisma.environment.findFirst({
      where: {
        projectId,
        key: createEnvironmentDto.key,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Environment key already exists in this project',
      );
    }

    return this.prisma.environment.create({
      data: {
        name: createEnvironmentDto.name,
        key: createEnvironmentDto.key,
        projectId,
      },
    });
  }

  async update(id: string, updateEnvironmentDto: UpdateEnvironmentDto) {
    const environment = await this.prisma.environment.findUnique({
      where: { id },
    });

    if (!environment) {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }

    // Check key conflict if updating key
    if (updateEnvironmentDto.key) {
      const existing = await this.prisma.environment.findFirst({
        where: {
          projectId: environment.projectId,
          key: updateEnvironmentDto.key,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Environment key already exists in this project',
        );
      }
    }

    return this.prisma.environment.update({
      where: { id },
      data: updateEnvironmentDto,
    });
  }

  async delete(id: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id },
    });

    if (!environment) {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }

    if (
      DEFAULT_ENVIRONMENT_KEYS.includes(
        environment.key as (typeof DEFAULT_ENVIRONMENT_KEYS)[number],
      )
    ) {
      throw new ForbiddenException(
        'Default environments (development, test, production) cannot be deleted',
      );
    }

    await this.prisma.environment.delete({
      where: { id },
    });

    return { message: 'Environment deleted successfully' };
  }
}
