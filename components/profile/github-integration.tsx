'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Github, Check, GitFork, Star, Loader2, Plus, ExternalLink } from 'lucide-react';
import { checkGitHubConnection, getGitHubRepositories } from '@/app/actions/github';
import { signIn } from 'next-auth/react';

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
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [importingInfo, setImportingInfo] = useState<string | null>(null);

  // Badge State
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [badgeUrl, setBadgeUrl] = useState<string>('');
  const [markdownCode, setMarkdownCode] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const status = await checkGitHubConnection();
      setIsConnected(status.connected);
      if (status.connected) {
        fetchRepos();
      }
    } catch (error) {
      console.error('Failed to check GitHub connection');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async () => {
    try {
      const res = await getGitHubRepositories();
      if (res.success) {
        setRepos(res.repositories || []);
      } else {
        toast.error('Failed to fetch repositories');
      }
    } catch (error) {
      toast.error('Error loading repositories');
    }
  };

  const handleImport = (repoName: string) => {
    setImportingInfo(repoName);
    // Placeholder for import logic
    setTimeout(() => {
      toast.success(`Imported ${repoName} to workspace (Simulated)`);
      setImportingInfo(null);
    }, 1500);
  };

  // ... Badge Only Logic ...
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isConnected) {
    return (
      <Card className="border-purple-500/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Repositories
          </CardTitle>
          <CardDescription>
            Import projects from your linked GitHub account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {repos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No repositories found.</p>
          ) : (
            repos.map(repo => (
              <div key={repo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{repo.name}</h4>
                    {repo.language && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        {repo.language}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {repo.stargazers_count}
                    </span>
                    <a href={repo.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      <ExternalLink className="h-3 w-3" /> View
                    </a>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleImport(repo.name)}
                  disabled={!!importingInfo}
                  className="shrink-0"
                >
                  {importingInfo === repo.name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Add
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  // existing badge UI for unlinked users
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Badge Integration
        </CardTitle>
        <CardDescription>
          Link your GitHub to import repos, or generate a stats badge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg flex items-center justify-between border border-orange-100 dark:border-orange-800">
          <div>
            <p className="font-bold text-sm text-orange-800 dark:text-orange-400">Not Linked to GitHub</p>
            <p className="text-xs text-orange-700/80 dark:text-orange-400/80">Connect your account to import repositories.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700"
            onClick={() => signIn('github')}
          >
            <Github className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>

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
