import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor(private configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
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

  get auditLog() {
    return this.prisma.auditLog;
  }

  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}
