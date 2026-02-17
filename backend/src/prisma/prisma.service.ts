import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get user() {
    return this.prisma.user;
  }

  get project() {
    return this.prisma.project;
  }

  get environment() {
    return this.prisma.environment;
  }

  get featureFlag() {
    return this.prisma.featureFlag;
  }

  get flagState() {
    return this.prisma.flagState;
  }
}
