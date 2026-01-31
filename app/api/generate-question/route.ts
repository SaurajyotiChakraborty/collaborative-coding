import { NextRequest, NextResponse } from 'next/server';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface GeneratedQuestion {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  tags: string[];
  constraints: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { prompt, difficulty } = body;

    if (!prompt || !difficulty) {
      return NextResponse.json(
        { error: 'Prompt and difficulty are required' },
        { status: 400 }
      );
    }

    // Call Gemini API to generate question
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert coding question developer. Generate a ${difficulty} level coding question based on the user's prompt. 
            The question should be high quality, challenging, and suitable for a competitive programming platform.
            
            Requirements:
            1. Title: Concise and descriptive.
            2. Description: Clear problem statement with at least two examples (input, output, and explanation).
            3. Test Cases: Provide 5-8 diverse test cases. Include:
               - Standard cases.
               - Edge cases (empty input, very large/small values, duplicates, etc.).
               - Performance-heavy cases if applicable.
            4. Constraints: Realistic and clearly defined.
            5. Tags: 3-5 relevant conceptual tags.

            Prompt: ${prompt}

            Return ONLY valid JSON with the following structure:
            {
              "title": "Question Title",
              "description": "Detailed description with examples in markdown format",
              "difficulty": "${difficulty}",
              "testCases": [
                {"input": "test input 1", "expectedOutput": "expected output 1"},
                ...
              ],
              "tags": ["tag1", "tag2"],
              "constraints": "Constraints description"
            }`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate question with AI' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let questionData: GeneratedQuestion;
    try {
      questionData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ question: questionData });
  } catch (error: unknown) {
    console.error('Error generating question:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
