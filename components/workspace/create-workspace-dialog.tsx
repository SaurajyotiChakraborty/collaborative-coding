'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GitBranch, Github, FolderGit2, Loader2, GitFork, Star, Lock } from 'lucide-react';
import { getGitHubRepositories } from '@/app/actions/github';
import { useEffect } from 'react';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateWorkspace: (data: WorkspaceCreateData) => Promise<void>;
}

export interface WorkspaceCreateData {
  name: string;
  gitRepoUrl: string;
  gitBranch: string;
}

import { useSession, signIn } from 'next-auth/react';

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  open,
  onClose,
  onCreateWorkspace,
}) => {
  const { data: session } = useSession();
  const [name, setName] = useState<string>('');
  const [gitRepoUrl, setGitRepoUrl] = useState<string>('');
  const [gitBranch, setGitBranch] = useState<string>('main');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // GitHub Integration State
  const [isConnected, setIsConnected] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    if (open) {
      checkConnection();
    }
  }, [open]);

  const checkConnection = async () => {
    setLoadingRepos(true);
    try {
      const { available, repositories } = await getGitHubRepositories();
      if (available) {
        setIsConnected(true);
        setRepos(repositories || []);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to load GitHub info');
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleRepoSelect = (repo: any) => {
    setGitRepoUrl(repo.html_url);
    setName((prev) => prev || repo.name); // Auto-fill name if empty
    setGitBranch(repo.default_branch || 'main');
  };

  const handleCreate = async (): Promise<void> => {
    if (!name.trim() || !gitRepoUrl.trim() || !gitBranch.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateWorkspace({
        name: name.trim(),
        gitRepoUrl: gitRepoUrl.trim(),
        gitBranch: gitBranch.trim(),
      });
      // Success toast managed by parent or here
      setName('');
      setGitRepoUrl('');
      setGitBranch('main');
      onClose();
    } catch (error) {
      // toast.error('Failed to create workspace'); // managed by parent
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-purple-600" />
            Create New Workspace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* GitHub Integration Section */}
          <div className="space-y-4">
            {loadingRepos ? (
              <div className="flex items-center justify-center py-4 bg-muted/20 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : isConnected ? (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-primary font-semibold">
                  <Github className="h-4 w-4" />
                  Select Repository
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50">
                  {repos.map(repo => (
                    <div
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo)}
                      className={`
                                    p-3 rounded-md cursor-pointer border transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20
                                    ${gitRepoUrl === repo.html_url ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500' : 'border-transparent hover:border-purple-200'}
                                `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate w-full">{repo.name}</span>
                        {repo.private && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3" /> {repo.stargazers_count}</span>
                        <span>•</span>
                        <span>{repo.language || 'Code'}</span>
                      </div>
                    </div>
                  ))}
                  {repos.length === 0 && <p className="text-sm text-muted-foreground p-2">No repositories found.</p>}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Use a manual URL below for other repositories.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 flex flex-col items-center text-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                  <Github className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Connect GitHub</h4>
                  <p className="text-xs text-muted-foreground max-w-[250px] mx-auto mt-1">
                    Link your account to browse and import your repositories directly.
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => signIn('github')}
                  className="bg-[#24292F] hover:bg-[#24292F]/90 text-white gap-2"
                >
                  <Github className="h-4 w-4" />
                  Link Account
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Project"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            {/* Git Repository URL */}
            <div className="space-y-2">
              <Label htmlFor="gitRepoUrl" className="flex items-center gap-2">
                <GitFork className="h-4 w-4" />
                Git Repository URL
              </Label>
              <Input
                id="gitRepoUrl"
                placeholder="https://github.com/username/repo.git"
                value={gitRepoUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGitRepoUrl(e.target.value)}
                disabled={isCreating}
              />
            </div>

            {/* Git Branch */}
            <div className="space-y-2">
              <Label htmlFor="gitBranch" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Branch
              </Label>
              <Input
                id="gitBranch"
                placeholder="main"
                value={gitBranch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGitBranch(e.target.value)}
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-semibold mb-2">What happens next?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Repository will be cloned to cloud storage</li>
              <li>• Unique invite code will be generated</li>
              <li>• You can invite team members to collaborate</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !name.trim() || !gitRepoUrl.trim() || !gitBranch.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isCreating ? 'Creating...' : 'Create Workspace'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
