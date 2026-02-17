import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private prisma;
    private pool;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get user(): import(".prisma/client").Prisma.UserDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get project(): import(".prisma/client").Prisma.ProjectDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get environment(): import(".prisma/client").Prisma.EnvironmentDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get featureFlag(): import(".prisma/client").Prisma.FeatureFlagDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    get flagState(): import(".prisma/client").Prisma.FlagStateDelegate<import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
