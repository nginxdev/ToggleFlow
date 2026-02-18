import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        environments: true,
        _count: {
          select: {
            flags: true,
            environments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        environments: true,
        flags: {
          include: {
            flagStates: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async create(createProjectDto: CreateProjectDto, userId: string) {
    // Check if project key already exists
    const existing = await this.prisma.project.findUnique({
      where: { key: createProjectDto.key },
    });

    if (existing) {
      throw new ConflictException('Project key already exists');
    }

    // Create project and environments in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // 1. Create project and link to user
      const project = await tx.project.create({
        data: {
          name: createProjectDto.name,
          key: createProjectDto.key,
          description: createProjectDto.description,
          users: {
            connect: {
              id: userId,
            },
          },
        },
      });

      // 2. Create default environments (development, staging, production)
      await tx.environment.createMany({
        data: [
          {
            name: 'Development',
            key: 'development',
            projectId: project.id,
          },
          {
            name: 'Test',
            key: 'test',
            projectId: project.id,
          },
          {
            name: 'Production',
            key: 'production',
            projectId: project.id,
            requireConfirmation: true,
          },
        ],
      });

      // 3. Return the project with environments and flags
      return tx.project.findUnique({
        where: { id: project.id },
        include: {
          environments: true,
          flags: {
            include: {
              flagStates: true,
            },
          },
        },
      });
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    // Check key conflict if updating key
    if (updateProjectDto.key) {
      const existing = await this.prisma.project.findFirst({
        where: {
          key: updateProjectDto.key,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Project key already exists');
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        environments: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    // Get all flags for this project to delete their states
    const flags = await this.prisma.featureFlag.findMany({
      where: { projectId: id },
      select: { id: true },
    });

    // Delete all flag states for all flags in this project
    if (flags.length > 0) {
      await this.prisma.flagState.deleteMany({
        where: {
          flagId: {
            in: flags.map((f) => f.id),
          },
        },
      });
    }

    // Delete all flags for this project
    await this.prisma.featureFlag.deleteMany({
      where: { projectId: id },
    });

    // Delete all environments for this project
    await this.prisma.environment.deleteMany({
      where: { projectId: id },
    });

    // Finally delete the project
    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}
