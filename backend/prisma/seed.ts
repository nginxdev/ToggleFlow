import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'm@example.com' },
    update: {},
    create: {
      email: 'm@example.com',
      username: 'pradeep',
      password: 'password123', // TODO: Hash this in production
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      username: 'john',
      password: 'password123', // TODO: Hash this in production
    },
  });

  console.log(`Created users: ${user1.username}, ${user2.username}`);

  // Create a demo project
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

  // Create environments
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

  console.log(
    `Created environments: ${prodEnv.name}, ${devEnv.name}`,
  );

  // Create a feature flag
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

  // Create flag states for each environment
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
