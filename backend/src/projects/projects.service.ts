import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number) {
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

  async create(createProjectDto: CreateProjectDto, userId: number) {
    // Check if project key already exists
    const existing = await this.prisma.project.findUnique({
      where: { key: createProjectDto.key },
    });

    if (existing) {
      throw new ConflictException('Project key already exists');
    }

    // Create project and link to user
    const project = await this.prisma.project.create({
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
      include: {
        environments: true,
      },
    });

    // Create default environments (development, staging, production)
    await Promise.all([
      this.prisma.environment.create({
        data: {
          name: 'Development',
          key: 'development',
          projectId: project.id,
        },
      }),
      this.prisma.environment.create({
        data: {
          name: 'Staging',
          key: 'staging',
          projectId: project.id,
        },
      }),
      this.prisma.environment.create({
        data: {
          name: 'Production',
          key: 'production',
          projectId: project.id,
        },
      }),
    ]);

    // Fetch project with environments
    return this.findOne(project.id, userId);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
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

  async delete(id: number, userId: number) {
    // Verify ownership
    await this.findOne(id, userId);

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}
