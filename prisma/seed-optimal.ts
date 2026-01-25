import { PrismaClient, QuestionDifficulty, UserRole } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding optimal practice questions...')

  const questions = [
    {
      id: 1,
      title: 'Two Sum Optimization',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Optimize for O(n) time complexity.',
      difficulty: QuestionDifficulty.Easy,
      testCases: [
        { input: '[2,7,11,15], 9', output: '[0,1]' },
        { input: '[3,2,4], 6', output: '[1,2]' }
      ],
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.',
      tags: ['Array', 'Hash Table'],
      canonicalSolution: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
      optimalTimeComplexity: 'O(n)',
      optimalSpaceComplexity: 'O(n)',
      optimalScore: 100
    },
    {
      id: 2,
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Implement an O(n) time and O(1) space solution.',
      difficulty: QuestionDifficulty.Easy,
      testCases: [
        { input: '"A man, a plan, a canal: Panama"', output: 'true' },
        { input: '"race a car"', output: 'false' }
      ],
      constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
      tags: ['Two Pointers', 'String'],
      canonicalSolution: `function isPalindrome(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (!isAlphanumeric(s[left])) {
            left++;
        } else if (!isAlphanumeric(s[right])) {
            right--;
        } else {
            if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
            left++;
            right--;
        }
    }
    return true;
}

function isAlphanumeric(char) {
    return /[a-z0-9]/i.test(char);
}`,
      optimalTimeComplexity: 'O(n)',
      optimalSpaceComplexity: 'O(1)',
      optimalScore: 100
    }
  ]

  // Find or create a system user first
  let systemUser = await prisma.user.findUnique({ where: { username: 'system' } })
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        username: 'system',
        email: 'system@optimize-coder.com',
        role: UserRole.Admin,
        xp: BigInt(0),
        rating: 2000
      }
    })
  }

  for (const q of questions) {
    const { id, ...data } = q
    await prisma.question.upsert({
      where: { id },
      update: { ...data, createdById: systemUser.id },
      create: { ...data, id, createdById: systemUser.id }
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
