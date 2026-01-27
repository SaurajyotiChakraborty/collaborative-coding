const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Create Achievements
    const achievements = [
        { name: 'First Steps', description: 'Solve your first problem', icon: 'Award', requirementType: 'QuestionsSolved', requirementValue: 1 },
        { name: 'Master Coder', description: 'Solve 100 problems', icon: 'Trophy', requirementType: 'QuestionsSolved', requirementValue: 100 },
        { name: 'Competition Winner', description: 'Win your first competition', icon: 'Zap', requirementType: 'CompetitionsWon', requirementValue: 1 },
    ];

    for (const ach of achievements) {
        await prisma.achievement.upsert({
            where: { id: ach.name.toLowerCase().replace(/ /g, '-') },
            update: ach,
            create: {
                id: ach.name.toLowerCase().replace(/ /g, '-'),
                ...ach
            },
        });
    }

    // 2. Create Questions
    const questions = [
        { title: 'Two Sum', description: 'Find two numbers that add up to a target.', difficulty: 'Easy', testCases: [], constraints: '', tags: ['array'], createdById: 'system' },
        { title: 'Reverse String', description: 'Reverse an array of characters.', difficulty: 'Easy', testCases: [], constraints: '', tags: ['string'], createdById: 'system' },
    ];

    // Note: System user must exist
    const systemUser = await prisma.user.upsert({
        where: { username: 'system' },
        update: {},
        create: { username: 'system', email: 'system@optimize.dev', role: 'Admin' },
    });

    for (const q of questions) {
        await prisma.question.create({
            data: { ...q, createdById: systemUser.id },
        });
    }

    // 3. Create Learning Paths
    const paths = [
        { name: 'Arrays Mastery', description: 'Master array manipulation', category: 'algorithms', difficulty: 'Beginner', order: 1 },
        { name: 'String Wizardry', description: 'Handle strings like a pro', category: 'algorithms', difficulty: 'Beginner', order: 2 },
    ];

    for (const path of paths) {
        await prisma.learningPath.create({
            data: path,
        });
    }

    console.log('Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
