import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { UpdateFlagStateDto } from './dto/update-flag-state.dto';
import { AuditService } from '../audit/audit.service';
import { DEFAULT_BOOLEAN_VARIATIONS } from './constants';

@Injectable()
export class FlagsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findByProject(projectId: string) {
    return this.prisma.featureFlag.findMany({
      where: { projectId, isArchived: false },
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

  async findArchivedByProject(projectId: string) {
    return this.prisma.featureFlag.findMany({
      where: { projectId, isArchived: true },
      include: {
        flagStates: {
          include: {
            environment: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
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

  async create(
    createFlagDto: CreateFlagDto,
    projectId: string,
    userId: string,
  ) {
    // Check if key already exists
    const existing = await this.prisma.featureFlag.findFirst({
      where: {
        key: createFlagDto.key,
      },
    });

    if (existing) {
      throw new ConflictException('Flag key already exists');
    }

    // Auto-generate variations for boolean flags if not provided
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let variations = createFlagDto.variations || [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (createFlagDto.type === 'boolean' && variations.length === 0) {
      variations = [
        { id: crypto.randomUUID(), name: 'True', value: 'true' },
        { id: crypto.randomUUID(), name: 'False', value: 'false' },
      ];
    }

    // Create the flag
    const flag = await this.prisma.featureFlag.create({
      data: {
        name: createFlagDto.name,
        key: createFlagDto.key,
        description: createFlagDto.description,
        type: createFlagDto.type || 'boolean',
        defaultValue: createFlagDto.defaultValue,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        variations: variations,
        projectId,
      },
    });

    await this.auditService.log({
      action: 'FLAG_CREATED',
      entity: 'FeatureFlag',
      entityId: flag.id,
      userId,
      payload: { name: flag.name, key: flag.key },
    });

    // Get all environments for this project
    const environments = await this.prisma.environment.findMany({
      where: { projectId },
    });

    // Create flag states for all environments (default: disabled)
    for (const env of environments) {
      await this.prisma.flagState.create({
        data: {
          flagId: flag.id,
          environmentId: env.id,
          isEnabled: false,
        },
      });
    }

    return this.findOne(flag.id);
  }

  async update(id: string, updateFlagDto: UpdateFlagDto, userId: string) {
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

    // ... (inside class)

    // Prevent deletion of default boolean variations
    if (flag.type === 'boolean' && updateFlagDto.variations) {
      const newVariations = updateFlagDto.variations as Array<{
        name: string;
        value: string;
      }>;

      for (const defaultVar of DEFAULT_BOOLEAN_VARIATIONS) {
        const exists = newVariations.some(
          (v) => v.value === defaultVar.value && v.name === defaultVar.name,
        );
        if (!exists) {
          throw new BadRequestException(
            `Boolean flags must include the default "${defaultVar.name}" variation.`,
          );
        }
      }
    }

    const updated = await this.prisma.featureFlag.update({
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

    await this.auditService.log({
      action: 'FLAG_UPDATED',
      entity: 'FeatureFlag',
      entityId: id,
      userId,
      payload: updateFlagDto,
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isSuperUser) {
      throw new ConflictException('Only superusers can delete flags');
    }

    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }

    if (flag.isArchived === false) {
      throw new ConflictException('Flag must be archived before deletion');
    }

    await this.prisma.featureFlag.delete({
      where: { id },
    });

    await this.auditService.log({
      action: 'FLAG_DELETED',
      entity: 'FeatureFlag',
      entityId: id,
      userId,
      payload: { name: flag.name, key: flag.key },
    });

    return { message: 'Feature flag deleted successfully' };
  }

  async archive(id: string, userId: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }

    const updated = await this.prisma.featureFlag.update({
      where: { id },
      data: { isArchived: true },
    });

    await this.auditService.log({
      action: 'FLAG_ARCHIVED',
      entity: 'FeatureFlag',
      entityId: id,
      userId,
    });

    return updated;
  }

  async unarchive(id: string, userId: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag with ID ${id} not found`);
    }

    const updated = await this.prisma.featureFlag.update({
      where: { id },
      data: { isArchived: false },
    });

    await this.auditService.log({
      action: 'FLAG_UNARCHIVED',
      entity: 'FeatureFlag',
      entityId: id,
      userId,
    });

    return updated;
  }

  async updateFlagState(
    flagId: string,
    environmentId: string,
    updateFlagStateDto: UpdateFlagStateDto,
    userId: string,
  ) {
    // Check if flag state exists
    const flagState = await this.prisma.flagState.findUnique({
      where: {
        flagId_environmentId: {
          flagId,
          environmentId,
        },
      },
      include: { environment: true },
    });

    if (!flagState) {
      throw new NotFoundException('Flag state not found');
    }

    const updated = await this.prisma.flagState.update({
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
      include: { environment: true, flag: true },
    });

    await this.auditService.log({
      action: 'FLAG_STATE_UPDATED',
      entity: 'FeatureFlag',
      entityId: flagId,
      userId,
      payload: {
        environment: updated.environment.key,
        isEnabled: updated.isEnabled,

        rules: updated.rules,
      },
    });

    return updated;
  }

  async getAudits(id: string) {
    return this.auditService.findByEntity('FeatureFlag', id);
  }
}
