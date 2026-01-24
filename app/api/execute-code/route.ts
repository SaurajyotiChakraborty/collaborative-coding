import { NextRequest, NextResponse } from 'next/server';
import { DockerCodeExecutor } from '@/packages/judge-engine/src/docker-executor';
import { executeCodeSchema } from '@/lib/validations';
import { logInfo, logError, logWarn } from '@/lib/logger';
import { ZodError } from 'zod';

export const maxDuration = 60; // 60 seconds max for code execution

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();

    // Validate input with Zod
    const validated = executeCodeSchema.parse(body);
    const { code, language, testCases, timeLimit, memoryLimit } = validated;

    logInfo('Code execution request received', {
      requestId,
      language,
      testCaseCount: testCases.length,
      codeLength: code.length,
    });
    if (!code || !language || !testCases || !Array.isArray(testCases)) {
      return NextResponse.json(
        { error: 'Invalid request: code, language, and testCases are required' },
        { status: 400 }
      );
    }

    if (!['javascript', 'python', 'java', 'cpp'].includes(language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }

    // Security: Limit code size
    if (code.length > 50000) {
      return NextResponse.json(
        { error: 'Code too large (max 50KB)' },
        { status: 400 }
      );
    }

    // Security: Limit test cases
    if (testCases.length > 100) {
      return NextResponse.json(
        { error: 'Too many test cases (max 100)' },
        { status: 400 }
      );
    }

    // Execute code in Docker container
    const executor = new DockerCodeExecutor();
    const result = await executor.execute({
      language,
      code,
      testCases,
      timeLimit: timeLimit || 5000,
      memoryLimit: memoryLimit || 256,
    });

    logInfo('Code execution completed successfully', {
      requestId,
      allPassed: result.allPassed,
      totalTime: result.totalTime,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      logWarn('Validation error in code execution', {
        requestId,
        errors: error.errors,
      });
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logError('Code execution failed', error as Error, { requestId });
    return NextResponse.json(
      {
        error: 'Execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
