import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        const questions = await prisma.question.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                tags: true,
                createdAt: true
            }
        });

        return NextResponse.json({ success: true, questions });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch questions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const question = await prisma.question.create({
            data: {
                title: body.title,
                description: body.description,
                difficulty: body.difficulty,
                tags: body.tags || [],
                constraints: body.constraints || '',
                testCases: body.testCases || [],
                createdById: (session.user as any).id
            }
        });

        return NextResponse.json({ success: true, question });
    } catch (error) {
        console.error('Failed to create question:', error);
        return NextResponse.json({ success: false, error: 'Failed to create question' }, { status: 500 });
    }
}
