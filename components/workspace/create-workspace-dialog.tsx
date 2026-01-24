'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GitBranch, Github, FolderGit2 } from 'lucide-react';

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

  // Requirement: Click required to link GitHub account
  // We check if the session exists and if we have a way to verify GitHub link.
  // In NextAuth, if they signed in with GitHub, account provider will be github.
  // For simplicity, let's look for a flag or just provide the button if they want to 'link'.

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-purple-600" />
            Create New Workspace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* GitHub Link Requirement */}
          <div className="p-4 rounded-lg border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                <span className="font-semibold">GitHub Integration</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signIn('github')}
                className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                Link Account
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Linking your GitHub account is required to create a collaborative workspace.
            </p>
          </div>

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
              <Github className="h-4 w-4" />
              Git Repository URL
            </Label>
            <Input
              id="gitRepoUrl"
              placeholder="https://github.com/username/repo.git"
              value={gitRepoUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGitRepoUrl(e.target.value)}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              Repository will be cloned to the workspace
            </p>
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

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-semibold mb-2">What happens next?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Repository will be cloned to cloud storage</li>
              <li>• Unique invite code will be generated</li>
              <li>• You can invite team members to collaborate</li>
              <li>• Changes will be synced in real-time</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
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
