import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { UpdateFlagStateDto } from './dto/update-flag-state.dto';

@Injectable()
export class FlagsService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: number) {
    return this.prisma.featureFlag.findMany({
      where: { projectId },
      include: {
        flagStates: {
          include: {
            environment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
      include: {
        flagStates: {
          include: {
            environment: true,
          },
        },
        project: {
          include: {
            environments: true,
          },
        },
      },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }

    return flag;
  }

  async create(createFlagDto: CreateFlagDto, projectId: number) {
    // Check if key already exists
    const existing = await this.prisma.featureFlag.findFirst({
      where: {
        key: createFlagDto.key,
      },
    });

    if (existing) {
      throw new ConflictException('Flag key already exists');
    }

    // Create the flag
    const flag = await this.prisma.featureFlag.create({
      data: {
        name: createFlagDto.name,
        key: createFlagDto.key,
        description: createFlagDto.description,
        type: createFlagDto.type || 'boolean',
        defaultValue: createFlagDto.defaultValue,
        variations: createFlagDto.variations,
        projectId,
      },
    });

    // Get all environments for this project
    const environments = await this.prisma.environment.findMany({
      where: { projectId },
    });

    // Create flag states for all environments (default: disabled)
    await Promise.all(
      environments.map((env) =>
        this.prisma.flagState.create({
          data: {
            flagId: flag.id,
            environmentId: env.id,
            isEnabled: false,
          },
        }),
      ),
    );

    return this.findOne(flag.id);
  }

  async update(id: number, updateFlagDto: UpdateFlagDto) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }

    // Check key conflict if updating key
    if (updateFlagDto.key) {
      const existing = await this.prisma.featureFlag.findFirst({
        where: {
          key: updateFlagDto.key,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Flag key already exists');
      }
    }

    return this.prisma.featureFlag.update({
      where: { id },
      data: updateFlagDto,
      include: {
        flagStates: {
          include: {
            environment: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }

    await this.prisma.featureFlag.delete({
      where: { id },
    });

    return { message: 'Feature flag deleted successfully' };
  }

  async updateFlagState(
    flagId: number,
    environmentId: number,
    updateFlagStateDto: UpdateFlagStateDto,
  ) {
    // Check if flag state exists
    const flagState = await this.prisma.flagState.findUnique({
      where: {
        flagId_environmentId: {
          flagId,
          environmentId,
        },
      },
    });

    if (!flagState) {
      throw new NotFoundException('Flag state not found');
    }

    return this.prisma.flagState.update({
      where: {
        flagId_environmentId: {
          flagId,
          environmentId,
        },
      },
      data: {
        isEnabled: updateFlagStateDto.isEnabled,
        rules: updateFlagStateDto.rules,
      },
      include: {
        environment: true,
        flag: true,
      },
    });
  }
}
