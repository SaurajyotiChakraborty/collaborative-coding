import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        await prisma.question.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete question:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();

        const question = await prisma.question.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                difficulty: body.difficulty,
                tags: body.tags,
                constraints: body.constraints
            }
        });

        return NextResponse.json({ success: true, question });
    } catch (error) {
        console.error('Failed to update question:', error);
        return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 });
    }
}
