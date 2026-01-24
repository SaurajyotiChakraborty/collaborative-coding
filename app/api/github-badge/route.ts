import { NextRequest, NextResponse } from 'next/server';

interface BadgeRequest {
  username: string;
  achievements: string[];
  rating: number;
  wins: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const achievements = searchParams.get('achievements')?.split(',') || [];
  const rating = parseInt(searchParams.get('rating') || '0', 10);
  const wins = parseInt(searchParams.get('wins') || '0', 10);

  if (!username) {
    return new NextResponse('Username required', { status: 400 });
  }

  const badgeSvg = generateBadgeSVG({
    username,
    achievements,
    rating,
    wins,
  });

  return new NextResponse(badgeSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as BadgeRequest;
    const { username, achievements, rating, wins } = body;

    const markdownBadge = `![Optimize Coder Badge](https://your-app-url.com/api/github-badge?username=${encodeURIComponent(username)}&achievements=${achievements.join(',')}&rating=${rating}&wins=${wins})`;

    const readmeContent = `
## 🏆 Optimize Coder Achievements

${markdownBadge}

### Stats
- **Rating**: ${rating}
- **Wins**: ${wins}
- **Achievements**: ${achievements.join(', ') || 'None yet'}

[View Profile](https://your-app-url.com/profile/${encodeURIComponent(username)})
`;

    return NextResponse.json({
      success: true,
      markdown: markdownBadge,
      readmeSnippet: readmeContent,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function generateBadgeSVG(data: BadgeRequest): string {
  const { username, achievements, rating, wins } = data;
  
  const rankColor = getRankColor(rating);
  const achievementIcons = achievements.slice(0, 3).map((_, i) => `⭐`).join(' ');

  return `
    <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${rankColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="400" height="150" rx="10" fill="url(#grad)"/>
      
      <text x="200" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">
        ${username}
      </text>
      
      <text x="200" y="70" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white" opacity="0.9">
        Optimize Coder
      </text>
      
      <text x="100" y="105" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white">
        Rating: ${rating}
      </text>
      
      <text x="200" y="105" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white">
        Wins: ${wins}
      </text>
      
      <text x="300" y="105" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white">
        ${achievementIcons}
      </text>
      
      <text x="200" y="130" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white" opacity="0.8">
        ${achievements[0] || 'Beginner Coder'}
      </text>
    </svg>
  `.trim();
}

function getRankColor(rating: number): string {
  if (rating >= 2000) return '#fbbf24';
  if (rating >= 1500) return '#a78bfa';
  if (rating >= 1000) return '#60a5fa';
  if (rating >= 500) return '#34d399';
  return '#94a3b8';
}
