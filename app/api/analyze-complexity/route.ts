import { NextRequest, NextResponse } from 'next/server';
import { ASTComplexityAnalyzer, calculateComplexityScore } from '@/lib/ast-analyzer';

export async function POST(request: NextRequest) {
    try {
        const { code, language } = await request.json();

        if (!code || !language) {
            return NextResponse.json(
                { error: 'Code and language are required' },
                { status: 400 }
            );
        }

        const analyzer = new ASTComplexityAnalyzer();
        const analysis = analyzer.analyze(code, language);
        const score = calculateComplexityScore(analysis);

        return NextResponse.json({
            success: true,
            analysis,
            score
        });
    } catch (error) {
        console.error('Complexity analysis error:', error);
        return NextResponse.json(
            { error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
