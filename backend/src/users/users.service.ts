import { Injectable, ConflictException } from '@nestjs/common';
import { IUser } from '../types/interfaces/user.interface';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<IUser | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return undefined;
    }

    return {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      password: user.password,
      email: user.email,
      lastProjectId: user.lastProjectId,
    };
  }

  async findById(userId: string): Promise<IUser | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return undefined;
    }

    return {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      password: user.password,
      email: user.email,
      lastProjectId: user.lastProjectId,
    };
  }

  async create(
    email: string,
    username: string,
    password: string,
    firstName?: string,
    lastName?: string,
    lastProjectId?: string | null,
  ): Promise<IUser> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        lastProjectId,
      },
    });

    return {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      password: user.password,
      email: user.email,
      lastProjectId: user.lastProjectId,
    };
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      language?: string;
      lastProjectId?: string | null;
    },
  ): Promise<IUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        language: data.language,
        lastProjectId: data.lastProjectId,
      },
    });

    return {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      password: user.password,
      email: user.email,
      lastProjectId: user.lastProjectId,
    };
  }
}
