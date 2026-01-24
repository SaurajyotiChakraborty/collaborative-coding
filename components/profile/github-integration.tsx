'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Github, Check } from 'lucide-react';

interface GitHubIntegrationProps {
  username: string;
  achievements: string[];
  rating: number;
  wins: number;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  username,
  achievements,
  rating,
  wins,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [badgeUrl, setBadgeUrl] = useState<string>('');
  const [markdownCode, setMarkdownCode] = useState<string>('');

  const generateBadge = async (): Promise<void> => {
    setGenerating(true);
    try {
      const response = await fetch('/api/github-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          achievements,
          rating,
          wins,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate badge');
      }

      const data = await response.json() as { success: boolean; markdown: string; readmeSnippet: string };
      
      const url = window.location.origin + `/api/github-badge?username=${encodeURIComponent(username)}&achievements=${achievements.join(',')}&rating=${rating}&wins=${wins}`;
      setBadgeUrl(url);
      setMarkdownCode(data.markdown);
      
      toast.success('Badge generated successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate badge';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error: unknown) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Badge Integration
        </CardTitle>
        <CardDescription>
          Generate a badge to showcase your achievements on GitHub
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateBadge} disabled={generating} className="w-full">
          {generating ? 'Generating...' : 'Generate Badge'}
        </Button>

        {badgeUrl && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Badge Preview</label>
              <div className="border rounded-md p-4 bg-gray-50 flex justify-center">
                <img src={badgeUrl} alt="GitHub Badge" className="max-w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Markdown Code</label>
              <div className="flex gap-2">
                <Input
                  value={markdownCode}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(markdownCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Direct URL</label>
              <div className="flex gap-2">
                <Input
                  value={badgeUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(badgeUrl)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
              <p className="font-semibold text-blue-900 mb-2">How to add to GitHub README:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Copy the markdown code above</li>
                <li>Open your GitHub profile README</li>
                <li>Paste the code where you want the badge</li>
                <li>Commit and push changes</li>
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
