import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'john.doe@toggleflow.com'
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user) {
    await prisma.user.update({
      where: { email },
      data: { isSuperUser: true },
    })
    console.log(`User ${email} is now a superuser.`)
  } else {
    console.log(`User ${email} not found.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
