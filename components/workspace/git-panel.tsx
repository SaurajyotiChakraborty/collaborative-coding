'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GitBranch, GitCommit, Upload, Download, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GitPanelProps {
  workspaceId: number;
  repoUrl: string;
  branch: string;
  status: string;
  isLeader: boolean;
  onPushToGit: (commitMessage: string) => Promise<void>;
  onPullFromGit: () => Promise<void>;
  onDeleteWorkspace: () => Promise<void>;
}

export const GitPanel: React.FC<GitPanelProps> = ({
  workspaceId,
  repoUrl,
  branch,
  status,
  isLeader,
  onPushToGit,
  onPullFromGit,
  onDeleteWorkspace,
}) => {
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const handlePush = async (): Promise<void> => {
    if (!commitMessage.trim()) {
      toast.error('Please enter a commit message');
      return;
    }

    setIsPushing(true);
    try {
      await onPushToGit(commitMessage.trim());
      setCommitMessage('');
      toast.success('Successfully pushed to Git!');
    } catch (error) {
      toast.error('Failed to push to Git');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async (): Promise<void> => {
    setIsPulling(true);
    try {
      await onPullFromGit();
      toast.success('Successfully pulled from Git!');
    } catch (error) {
      toast.error('Failed to pull from Git');
    } finally {
      setIsPulling(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await onDeleteWorkspace();
      toast.success('Workspace deleted');
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Active: 'bg-green-500',
      Synced: 'bg-blue-500',
      Archived: 'bg-gray-500',
      PendingDeletion: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <>
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            Git Integration
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage version control for this workspace
          </p>
        </div>

        {/* Repository Info */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Repository</Label>
            <p className="text-sm font-mono truncate">{repoUrl}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-muted-foreground">Branch</Label>
              <p className="text-sm font-semibold">{branch}</p>
            </div>
            <Badge className={getStatusColor(status)}>{status}</Badge>
          </div>
        </div>

        {/* Pull from Git */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handlePull}
            disabled={isPulling || !isLeader}
          >
            <Download className="h-4 w-4 mr-2" />
            {isPulling ? 'Pulling...' : 'Pull Latest Changes'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Fetch and merge latest changes from repository
          </p>
        </div>

        {/* Push to Git (Leader Only) */}
        {isLeader && (
          <div className="space-y-3 pt-3 border-t">
            <div>
              <Label htmlFor="commitMessage" className="flex items-center gap-2">
                <GitCommit className="h-4 w-4" />
                Commit Message
              </Label>
              <Textarea
                id="commitMessage"
                placeholder="Describe your changes..."
                value={commitMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCommitMessage(e.target.value)
                }
                className="mt-2"
                rows={3}
                disabled={isPushing}
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={handlePush}
              disabled={!commitMessage.trim() || isPushing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isPushing ? 'Pushing...' : 'Push to Repository'}
            </Button>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                Pushing will commit all changes and update the remote repository. Cloud storage will be cleared after successful push.
              </p>
            </div>
          </div>
        )}

        {/* Delete Workspace (Leader Only) */}
        {isLeader && (
          <div className="pt-3 border-t">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Workspace
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This action cannot be undone
            </p>
          </div>
        )}

        {/* Non-leader notice */}
        {!isLeader && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Only the workspace leader can push changes to Git or delete the workspace.
            </p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace and remove all members. Any unpushed changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
