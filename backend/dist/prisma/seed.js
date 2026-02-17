"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    const user1 = await prisma.user.upsert({
        where: { email: 'm@example.com' },
        update: {},
        create: {
            email: 'm@example.com',
            username: 'pradeep',
            password: 'password123',
        },
    });
    const user2 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            username: 'john',
            password: 'password123',
        },
    });
    console.log(`Created users: ${user1.username}, ${user2.username}`);
    const project = await prisma.project.create({
        data: {
            name: 'Demo Project',
            key: 'demo-project',
            description: 'A sample project for testing',
            users: {
                connect: [{ id: user1.id }, { id: user2.id }],
            },
        },
    });
    console.log(`Created project: ${project.name}`);
    const prodEnv = await prisma.environment.create({
        data: {
            name: 'Production',
            key: 'production',
            projectId: project.id,
        },
    });
    const devEnv = await prisma.environment.create({
        data: {
            name: 'Development',
            key: 'development',
            projectId: project.id,
        },
    });
    console.log(`Created environments: ${prodEnv.name}, ${devEnv.name}`);
    const flag = await prisma.featureFlag.create({
        data: {
            name: 'New Dashboard',
            key: 'new-dashboard',
            description: 'Enable the redesigned dashboard',
            type: 'boolean',
            defaultValue: 'false',
            projectId: project.id,
        },
    });
    console.log(`Created flag: ${flag.name}`);
    await prisma.flagState.create({
        data: {
            isEnabled: true,
            flagId: flag.id,
            environmentId: devEnv.id,
        },
    });
    await prisma.flagState.create({
        data: {
            isEnabled: false,
            flagId: flag.id,
            environmentId: prodEnv.id,
        },
    });
    console.log('Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map