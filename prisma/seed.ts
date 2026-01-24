import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@optimizecoder.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@optimizecoder.com',
            role: 'Admin',
            rating: 1500,
            xp: BigInt(1000),
            titles: ['Platform Admin'],
            achievements: ['First User', 'Admin Access']
        }
    });
    console.log('✅ Created admin user:', admin.username);

    // Create regular test user
    const testUser = await prisma.user.upsert({
        where: { email: 'user@test.com' },
        update: {},
        create: {
            username: 'testuser',
            email: 'user@test.com',
            role: 'User',
            rating: 1200,
            xp: BigInt(0),
            titles: [],
            achievements: []
        }
    });
    console.log('✅ Created test user:', testUser.username);

    // Create sample questions
    const easyQuestion = await prisma.question.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: 'Two Sum',
            description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
            difficulty: 'Easy',
            constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
            tags: ['array', 'hash-table'],
            testCases: [
                { input: '[2,7,11,15], 9', output: '[0,1]' },
                { input: '[3,2,4], 6', output: '[1,2]' },
                { input: '[3,3], 6', output: '[0,1]' }
            ],
            createdById: admin.id,
            isAiGenerated: false
        }
    });
    console.log('✅ Created question:', easyQuestion.title);

    const mediumQuestion = await prisma.question.upsert({
        where: { id: 2 },
        update: {},
        create: {
            title: 'Longest Substring Without Repeating Characters',
            description: `Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.`,
            difficulty: 'Medium',
            constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
            tags: ['string', 'sliding-window', 'hash-table'],
            testCases: [
                { input: '"abcabcbb"', output: '3' },
                { input: '"bbbbb"', output: '1' },
                { input: '"pwwkew"', output: '3' }
            ],
            createdById: admin.id,
            isAiGenerated: false
        }
    });
    console.log('✅ Created question:', mediumQuestion.title);

    const hardQuestion = await prisma.question.upsert({
        where: { id: 3 },
        update: {},
        create: {
            title: 'Median of Two Sorted Arrays',
            description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Example:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.`,
            difficulty: 'Hard',
            constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000',
            tags: ['array', 'binary-search', 'divide-and-conquer'],
            testCases: [
                { input: '[1,3], [2]', output: '2.0' },
                { input: '[1,2], [3,4]', output: '2.5' }
            ],
            createdById: admin.id,
            isAiGenerated: false
        }
    });
    console.log('✅ Created question:', hardQuestion.title);

    // Create sample competition
    const competition = await prisma.competition.create({
        data: {
            mode: 'Human',
            maxParticipants: 4,
            hasTimeLimit: true,
            timeLimitMinutes: 60,
            status: 'Waiting',
            createdById: admin.id,
            questions: {
                connect: [
                    { id: easyQuestion.id },
                    { id: mediumQuestion.id }
                ]
            },
            participants: {
                connect: [{ id: admin.id }]
            }
        }
    });
    console.log('✅ Created sample competition:', competition.id);

    // Create leaderboard entries
    await prisma.leaderboardEntry.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
            userId: admin.id,
            rank: 1,
            totalPoints: BigInt(1000),
            totalWins: 5,
            currentStreak: 3,
            bestStreak: 5,
            competitionsCompleted: 10
        }
    });
    console.log('✅ Created leaderboard entry for admin');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
