import { NextRequest, NextResponse } from 'next/server';

interface ExecuteCodeRequest {
  code: string;
  language: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  typescript: 74,
  go: 60,
  rust: 73,
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as ExecuteCodeRequest;
    const { code, language, testCases } = body;

    if (!code || !language || !testCases) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          const submissionResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || 'demo-key',
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            },
            body: JSON.stringify({
              source_code: code,
              language_id: languageId,
              stdin: testCase.input,
              expected_output: testCase.expectedOutput,
            }),
          });

          if (!submissionResponse.ok) {
            return {
              passed: false,
              input: testCase.input,
              expected: testCase.expectedOutput,
              actual: null,
              error: 'Execution failed',
              time: 0,
              memory: 0,
            };
          }

          const result = await submissionResponse.json() as Judge0Response;

          const passed = result.stdout?.trim() === testCase.expectedOutput.trim();
          
          return {
            passed,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: result.stdout?.trim() || result.stderr?.trim() || null,
            error: result.stderr || null,
            time: parseFloat(result.time || '0'),
            memory: result.memory || 0,
            statusDescription: result.status.description,
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            passed: false,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: null,
            error: errorMessage,
            time: 0,
            memory: 0,
          };
        }
      })
    );

    const allPassed = results.every((r) => r.passed);
    const totalTime = results.reduce((sum, r) => sum + r.time, 0);
    const avgMemory = results.reduce((sum, r) => sum + r.memory, 0) / results.length;

    const complexityEstimate = estimateComplexity(code, totalTime, testCases.length);

    return NextResponse.json({
      success: true,
      allPassed,
      results,
      totalTime,
      avgMemory,
      timeComplexity: complexityEstimate.time,
      spaceComplexity: complexityEstimate.space,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function estimateComplexity(code: string, executionTime: number, testCaseCount: number): { time: string; space: string } {
  const lowerCode = code.toLowerCase();
  
  let timeComplexity = 'O(n)';
  if (lowerCode.includes('for') && lowerCode.split('for').length > 2) {
    timeComplexity = 'O(n²)';
  } else if (lowerCode.includes('sort')) {
    timeComplexity = 'O(n log n)';
  } else if (lowerCode.includes('recursion') || lowerCode.includes('fibonacci')) {
    timeComplexity = 'O(2^n)';
  } else if (executionTime < 10 && testCaseCount > 0) {
    timeComplexity = 'O(1)';
  }

  let spaceComplexity = 'O(1)';
  if (lowerCode.includes('array') || lowerCode.includes('list') || lowerCode.includes('[]')) {
    spaceComplexity = 'O(n)';
  } else if (lowerCode.includes('matrix') || (lowerCode.split('array').length > 2)) {
    spaceComplexity = 'O(n²)';
  }

  return { time: timeComplexity, space: spaceComplexity };
}
