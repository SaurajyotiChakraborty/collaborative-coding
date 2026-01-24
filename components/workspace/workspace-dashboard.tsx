'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, GitBranch, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Workspace {
  id: number;
  name: string;
  leaderId: string;
  inviteCode: string;
  gitRepoUrl: string;
  gitBranch: string;
  status: string;
  createdAt: Date;
  memberCount: number;
}

interface WorkspaceDashboardProps {
  onCreateWorkspace: () => void;
  onJoinWorkspace: (inviteCode: string) => void;
  onOpenWorkspace: (id: number) => void;
  workspaces: Workspace[];
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  onCreateWorkspace,
  onJoinWorkspace,
  onOpenWorkspace,
  workspaces,
}) => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleJoin = async (): Promise<void> => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setIsJoining(true);
    try {
      await onJoinWorkspace(inviteCode.trim());
      setInviteCode('');
      toast.success('Successfully joined workspace!');
    } catch (error) {
      toast.error('Failed to join workspace');
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      Active: 'bg-green-500',
      Synced: 'bg-blue-500',
      Archived: 'bg-gray-500',
      PendingDeletion: 'bg-red-500',
    };
    return statusColors[status] || 'bg-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Collaborative Workspaces
          </h1>
          <p className="text-muted-foreground mt-1">
            Code together in real-time with your team
          </p>
        </div>
        <Button
          onClick={onCreateWorkspace}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {/* Join Workspace Section */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Join a Workspace
        </h2>
        <div className="flex gap-3">
          <Input
            placeholder="Enter invite code (e.g., INV-123-456)"
            value={inviteCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteCode(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                void handleJoin();
              }
            }}
            className="flex-1"
            disabled={isJoining}
          />
          <Button
            onClick={handleJoin}
            disabled={isJoining || !inviteCode.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isJoining ? 'Joining...' : 'Join'}
          </Button>
        </div>
      </Card>

      {/* Workspaces List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>
        {workspaces.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first workspace or join an existing one to get started
            </p>
            <Button
              onClick={onCreateWorkspace}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace: Workspace) => (
              <Card
                key={workspace.id}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-purple-500"
                onClick={() => onOpenWorkspace(workspace.id)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold truncate flex-1 group-hover:text-purple-600 transition-colors">
                      {workspace.name}
                    </h3>
                    <Badge className={getStatusColor(workspace.status)}>
                      {workspace.status}
                    </Badge>
                  </div>

                  {/* Git Info */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <span className="truncate">{workspace.gitBranch}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{workspace.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Code: {workspace.inviteCode}
                    </span>
                    <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
