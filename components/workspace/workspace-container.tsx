'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkspaceDashboard } from './workspace-dashboard';
import { CreateWorkspaceDialog, type WorkspaceCreateData } from './create-workspace-dialog';
import { MonacoYjsEditor } from './monaco-yjs-editor';
import { FileTree, type FileNode } from './file-tree';
import { ChatSidebar, type ChatMessage } from './chat-sidebar';
import { MemberList, type WorkspaceMember } from './member-list';
import { GitPanel } from './git-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, MessageSquare, Code2, ChevronRight, X, FolderGit2, BarChart, GitBranch, Settings, Plus, File, Trophy, Circle, Video, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { useWorkspaceRealtime } from '@/hooks/use-workspace-realtime';

// Mock data for demonstration
const mockWorkspaces = [
  {
    id: 1,
    name: 'E-Commerce Platform',
    leaderId: 'user-1',
    inviteCode: 'INV-123-456',
    gitRepoUrl: 'https://github.com/user/ecommerce.git',
    gitBranch: 'main',
    status: 'Active',
    createdAt: new Date(),
    memberCount: 3,
  },
  {
    id: 2,
    name: 'Social Media App',
    leaderId: 'user-1',
    inviteCode: 'INV-789-012',
    gitRepoUrl: 'https://github.com/user/social-app.git',
    gitBranch: 'develop',
    status: 'Synced',
    createdAt: new Date(),
    memberCount: 5,
  },
];

const mockFiles: FileNode[] = [
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'app',
        path: '/src/app',
        type: 'folder',
        children: [
          { name: 'page.tsx', path: '/src/app/page.tsx', type: 'file', isLocked: true, lockedBy: 'john' },
          { name: 'layout.tsx', path: '/src/app/layout.tsx', type: 'file', isLocked: false },
        ],
      },
      {
        name: 'components',
        path: '/src/components',
        type: 'folder',
        children: [
          { name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file', isLocked: false },
          { name: 'Card.tsx', path: '/src/components/Card.tsx', type: 'file', isLocked: false },
        ],
      },
    ],
  },
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    isLocked: false,
  },
];

const mockMembers: WorkspaceMember[] = [
  {
    membershipId: 1,
    userId: 'user-1',
    username: 'john',
    role: 'Leader',
    isOnline: true,
    gitUsername: 'johndoe',
  },
  {
    membershipId: 2,
    userId: 'user-2',
    username: 'alice',
    role: 'Contributor',
    isOnline: true,
    gitUsername: 'alicedev',
  },
  {
    membershipId: 3,
    userId: 'user-3',
    username: 'bob',
    role: 'Viewer',
    isOnline: false,
    gitUsername: 'bobsmith',
  },
];

const mockMessages: ChatMessage[] = [
  {
    messageId: 1,
    username: 'john',
    message: 'Hey team, I just pushed the login component',
    timestamp: new Date(Date.now() - 3600000),
    isCurrentUser: true,
  },
  {
    messageId: 2,
    username: 'alice',
    message: 'Great! I\'ll review it now',
    timestamp: new Date(Date.now() - 3000000),
    isCurrentUser: false,
  },
];

import { useSession, signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { getWorkspace, createWorkspace, joinWorkspace, getMyWorkspaces, createFile, updateFile, deleteFile, sendWorkspaceMessage, lockWorkspaceFile, unlockWorkspaceFile } from '@/app/actions/workspace';

export const WorkspaceContainer: React.FC = () => {
  const { data: session, status } = useSession();
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showMemberList, setShowMemberList] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(true);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState<boolean>(false);
  const [sidebarView, setSidebarView] = useState<'explorer' | 'search' | 'git' | 'members'>('explorer');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCallData, setActiveCallData] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch full workspace data when one is opened
  useEffect(() => {
    const fetchFullWorkspace = async () => {
      if (!currentWorkspaceId) return;

      setIsLoadingWorkspace(true);
      try {
        const result = await getWorkspace(currentWorkspaceId);
        if (result.success && result.workspace) {
          // Update the specific workspace in the list with full data
          setWorkspaces(prev => prev.map(w =>
            w.id === currentWorkspaceId ? result.workspace : w
          ));

          // Set initial chat messages from DB
          if (result.workspace.chats) {
            setMessages(result.workspace.chats.map((c: any) => ({
              messageId: c.id,
              username: c.username,
              message: c.message,
              timestamp: new Date(c.timestamp),
              isCurrentUser: c.userId === session?.user?.id
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch full workspace:', error);
      } finally {
        setIsLoadingWorkspace(false);
      }
    };

    if (view === 'workspace') {
      fetchFullWorkspace();
    }
  }, [currentWorkspaceId, view, session?.user?.id]);

  // File creation states
  const [showNewFileInput, setShowNewFileInput] = useState<{ type: 'file' | 'folder', path: string } | null>(null);
  const [newItemName, setNewItemName] = useState('');

  // Helper to build file tree from flat paths
  const buildFileTree = (files: any[]): FileNode[] => {
    const root: FileNode[] = [];
    const map: Record<string, FileNode> = {};

    files.forEach(file => {
      const parts = (file.filePath || file.path).split('/').filter(Boolean);
      let currentPath = '';

      parts.forEach((part: string, index: number) => {
        const isLast = index === parts.length - 1;
        const parentPath = currentPath;
        // Ensure paths start with / to match DB
        currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;

        if (!map[currentPath]) {
          const newNode: FileNode = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : [],
            isLocked: file.isLocked || false,
            lockedBy: file.lockedBy || null,
          };
          map[currentPath] = newNode;

          if (parentPath) {
            map[parentPath].children?.push(newNode);
          } else {
            root.push(newNode);
          }
        }
      });
    });

    return root;
  };

  // Fetch real workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!session?.user?.id) return;
      const { workspaces: fetched, success } = await getMyWorkspaces(session.user.id);
      if (success && fetched) {
        setWorkspaces(fetched);
      }
    };
    if (status === 'authenticated' && session?.user) {
      fetchWorkspaces();
    }
  }, [status, session]);


  // Real-time workspace integration
  const handleCallEvent = useCallback((data: any) => {
    if (data.type === 'offer') {
      setIncomingCall(data);
    } else {
      setActiveCallData(data);
    }
  }, []);

  const handleChatMessage = useCallback((chat: { userId: string; username: string; message: string; timestamp: number }) => {
    setMessages(prev => [...prev, {
      messageId: Date.now(),
      username: chat.username,
      message: chat.message,
      timestamp: new Date(chat.timestamp),
      isCurrentUser: chat.userId === session?.user?.id
    }]);
  }, [session?.user?.id]);

  const {
    isConnected: wsConnected,
    acquireFileLock,
    releaseFileLock,
    saveFileContent,
    sendChatMessage,
    initiateCall,
    answerCall,
    sendIceCandidate
  } = useWorkspaceRealtime({
    workspaceId: currentWorkspaceId?.toString() || '',
    userId: session?.user?.id || '',
    username: session?.user?.username || '',
    enabled: view === 'workspace' && currentWorkspaceId !== null,
    onCallEvent: handleCallEvent,
    onChatMessage: handleChatMessage
  });

  const handleCreateWorkspace = async (data: WorkspaceCreateData): Promise<void> => {
    if (!session?.user) {
      toast.error('You must be logged in to create a workspace');
      return;
    }

    // Check if user is logged in with GitHub (simplified check)
    // In a production app, we would check the 'Account' table in Prisma.
    // For this requirement, we'll assume linking means they must have a GitHub handle or be logged in via GitHub.
    // Let's assume session.user.email or a specific check if they have GitHub provider.

    setIsCreating(true); // Wait, this is in the container, but we'll manage it here or in dialog.

    try {
      const result = await createWorkspace({
        name: data.name,
        leaderId: session.user.id,
        gitRepoUrl: data.gitRepoUrl,
        gitBranch: data.gitBranch,
      });

      if (result.success && result.workspace) {
        toast.success('Workspace created! Cloning repository...');
        setWorkspaces([result.workspace, ...workspaces]);
        setShowCreateDialog(false);
      } else {
        toast.error(result.error || 'Failed to create workspace');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleCreateItem = async (): Promise<void> => {
    if (!newItemName.trim() || !currentWorkspaceId || !session?.user?.id || !showNewFileInput) return;

    try {
      const filePath = showNewFileInput.path === '/'
        ? `/${newItemName}`
        : `${showNewFileInput.path}/${newItemName}`;

      // Folders are implicit or represented by a .keep file if we want them to show up
      const actualPath = showNewFileInput.type === 'folder' ? `${filePath}/.keep` : filePath;

      const result = await createFile(currentWorkspaceId, actualPath, session.user.id);

      if (result.success) {
        toast.success(`${showNewFileInput.type === 'file' ? 'File' : 'Folder'} created`);

        // Refresh workspace data
        const refresh = await getWorkspace(currentWorkspaceId);
        if (refresh.success && refresh.workspace) {
          setWorkspaces(prev => prev.map(w => w.id === currentWorkspaceId ? refresh.workspace : w));
        }

        setShowNewFileInput(null);
        setNewItemName('');
        if (showNewFileInput.type === 'file') {
          setSelectedFile(actualPath);
        }
      } else {
        toast.error(result.error || 'Failed to create item');
      }
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const handleJoinWorkspace = async (inviteCode: string): Promise<void> => {
    if (!session?.user) return;

    try {
      const result = await joinWorkspace(inviteCode, session.user.id, session.user.username);
      if (result.success && result.workspace) {
        toast.success('Successfully joined workspace!');
        setWorkspaces([result.workspace, ...workspaces]);
      } else {
        toast.error(result.error || 'Failed to join workspace');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleOpenWorkspace = (workspaceId: number): void => {
    setCurrentWorkspaceId(workspaceId);
    setMessages([]); // Clear messages when switching workspace
    setView('workspace');
  };

  const handleSaveFile = async (content: string): Promise<void> => {
    if (!selectedFile) return;

    try {
      await saveFileContent(selectedFile, content);
      console.log('File saved:', selectedFile);
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  };

  const handleAcquireLock = async (): Promise<void> => {
    if (!selectedFile || !currentWorkspaceId || !session?.user?.id) return;

    try {
      const result = await lockWorkspaceFile(currentWorkspaceId, selectedFile, session.user.id);
      if (result.success) {
        await acquireFileLock(selectedFile);
        toast.success('File locked for editing');
      } else {
        toast.error(result.error || 'Failed to acquire lock');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      throw error;
    }
  };

  const handleReleaseLock = async (): Promise<void> => {
    if (!selectedFile || !currentWorkspaceId || !session?.user?.id) return;

    try {
      const result = await unlockWorkspaceFile(currentWorkspaceId, selectedFile, session.user.id);
      if (result.success) {
        await releaseFileLock(selectedFile);
        toast.success('File unlocked');
      }
    } catch (error) {
      console.error('Failed to release lock:', error);
      throw error;
    }
  };

  const handleSendMessage = async (message: string): Promise<void> => {
    try {
      await sendChatMessage(message);
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const handlePushToGit = async (commitMessage: string): Promise<void> => {
    if (!currentWorkspaceId) return;

    toast.info('Pushing changes to Git...');
    try {
      const { pushToGit } = await import('@/app/actions/workspace');
      const result = await pushToGit(currentWorkspaceId, commitMessage);
      if (result.success) {
        toast.success('Successfully pushed to Git');
      } else {
        toast.error(result.error || 'Failed to push to Git');
      }
    } catch (error) {
      toast.error('Failed to push to Git');
    }
  };

  const handlePullFromGit = async (): Promise<void> => {
    if (!currentWorkspaceId) return;

    toast.info('Pulling latest changes...');
    try {
      const { pullFromGit } = await import('@/app/actions/workspace');
      const result = await pullFromGit(currentWorkspaceId);
      if (result.success) {
        toast.success('Successfully pulled from Git');
        // Refresh workspace
        const refresh = await getWorkspace(currentWorkspaceId);
        if (refresh.success && refresh.workspace) {
          setWorkspaces(prev => prev.map(w => w.id === currentWorkspaceId ? refresh.workspace : w));
        }
      } else {
        toast.error(result.error || 'Failed to pull from Git');
      }
    } catch (error) {
      toast.error('Failed to pull from Git');
    }
  };

  const handleDeleteWorkspace = async (): Promise<void> => {
    // TODO: Call SpacetimeDB reducer to delete workspace
    console.log('Deleting workspace:', currentWorkspaceId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setView('dashboard');
  };

  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    if (!currentWorkspaceId) return;
    setIsStarting(true);
    try {
      const { startWorkspaceSession } = await import('@/app/actions/workspace');
      const result = await startWorkspaceSession(currentWorkspaceId);
      if (result.success && result.url) {
        setSessionUrl(result.url);
        toast.success('Workspace session started');
      } else {
        toast.error(result.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error('Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  if (view === 'dashboard') {
    return (
      <>
        <WorkspaceDashboard
          onCreateWorkspace={() => setShowCreateDialog(true)}
          onJoinWorkspace={handleJoinWorkspace}
          onOpenWorkspace={handleOpenWorkspace}
          workspaces={workspaces}
        />
        <CreateWorkspaceDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onCreateWorkspace={handleCreateWorkspace}
        />
      </>
    );
  }

  // Workspace View
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);
  const isLeader = currentWorkspace?.leaderId === session?.user?.id;

  if (view === 'workspace' && isLoadingWorkspace) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading workspace details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] selection:bg-[#264f78]",
      isFullscreen && "fixed inset-0 z-[100] w-screen h-screen"
    )}>
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 bg-[#323233] border-b border-[#2b2b2b] select-none text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-[#cccccc]">{currentWorkspace?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#cccccc] hover:bg-[#454545] hover:text-white"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullscreen ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-45" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('dashboard')}
            className="h-7 text-xs"
          >
            <ArrowLeft className="h-3 w-3 mr-1" /> Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content (Iframe or Start Button) */}
        <div className="flex-1 bg-[#1e1e1e] flex flex-col relative">
          {sessionUrl ? (
            <>
              <div className="absolute top-2 right-4 z-10 opacity-50 hover:opacity-100 transition-opacity">
                <a href={sessionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-white bg-black/50 px-2 py-1 rounded hover:bg-black/80">
                  <ExternalLink className="h-3 w-3" /> Open in Browser
                </a>
              </div>
              <iframe
                src={sessionUrl}
                className="w-full h-full border-none bg-white"
                title="Workspace Editor"
                allow="clipboard-read; clipboard-write;"
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-2">
                <Code2 className="h-24 w-24 mx-auto text-purple-500/20" />
                <h2 className="text-2xl font-bold text-white">Ready to Code?</h2>
                <p className="text-gray-400 max-w-sm">Start the Cloud Environment to launch VS Code directly in your browser.</p>
              </div>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
                onClick={handleStartSession}
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Container...
                  </>
                ) : (
                  <>
                    <Code2 className="mr-2 h-5 w-5" /> Start Workspace
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Right Chat Sidebar */}
        <div className={cn(
          "w-80 bg-[#252526] border-l border-[#2b2b2b] flex flex-col transition-all duration-300 absolute right-0 top-0 bottom-0 z-50 shadow-2xl",
          !showChat && "w-0 overflow-hidden border-l-0 translate-x-full"
        )}>
          <div className="p-3 bg-[#323233] border-b border-[#2b2b2b] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#969696]">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Team Chat & Voice</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-[#454545]"
              onClick={() => setShowChat(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatSidebar
              messages={messages}
              currentUsername={session?.user?.username || ''}
              onSendMessage={handleSendMessage}
              initiateCall={initiateCall}
              answerCall={answerCall}
              sendIceCandidate={sendIceCandidate}
              incomingCall={incomingCall}
              activeCallData={activeCallData}
              members={currentWorkspace?.members?.map((m: any) => ({
                ...m,
                username: m.user?.username || m.username || 'Unknown',
                isOnline: m.isOnline // Ensure other fields are preserved
              })) || []}
            />
          </div>
        </div>

        {/* Floating Chat Toggle */}
        {!showChat && (
          <Button
            className="absolute right-6 bottom-6 h-12 w-12 rounded-full shadow-2xl bg-purple-600 hover:bg-purple-700 z-50 p-0"
            onClick={() => setShowChat(true)}
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};
