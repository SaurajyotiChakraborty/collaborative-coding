import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            role: true
        }
    })
    console.log('USERS_IN_DB:', JSON.stringify(users, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
