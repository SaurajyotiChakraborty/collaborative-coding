'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic'
import type * as monaco from 'monaco-editor';
import * as Y from 'yjs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, LockOpen, Eye, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createYjsProvider, type CollaborativeTextProvider } from '@/lib/yjs-provider';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
)

interface MonacoYjsEditorProps {
  workspaceId: string;
  userId: string;
  username: string;
  filePath: string;
  initialContent: string;
  language: string;
  isLocked: boolean;
  lockedBy: string | null;
  onSave: (content: string) => Promise<void>;
  onAcquireLock: () => Promise<void>;
  onReleaseLock: () => Promise<void>;
}

/**
 * Monaco Editor with Yjs real-time collaboration
 */
export const MonacoYjsEditor: React.FC<MonacoYjsEditorProps> = ({
  workspaceId,
  userId,
  username,
  filePath,
  initialContent,
  language,
  isLocked,
  lockedBy,
  onSave,
  onAcquireLock,
  onReleaseLock,
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<number>(1);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const yjsProviderRef = useRef<CollaborativeTextProvider | null>(null);
  const bindingRef = useRef<any | null>(null); // MonacoBinding type loaded dynamically

  const canEdit = isLocked && lockedBy === username;
  const isReadOnly = isLocked && lockedBy !== username;

  // Initialize Yjs provider
  useEffect(() => {
    const provider = createYjsProvider({
      workspaceId,
      userId,
      username,
    });

    provider.connect();
    yjsProviderRef.current = provider;

    // Listen for awareness changes (other users)
    const unsubscribe = provider.onAwarenessChange(() => {
      const states = provider.getAwarenessStates();
      setActiveUsers(states.size);
    });

    return () => {
      unsubscribe();
      provider.disconnect();
    };
  }, [workspaceId, userId, username]);

  // Setup Monaco editor with Yjs binding
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor): void => {
    editorRef.current = editor;

    if (!yjsProviderRef.current) return;

    const provider = yjsProviderRef.current;
    const yText = provider.getSharedText(filePath);

    // Initialize content if empty
    if (yText.length === 0 && initialContent) {
      yText.insert(0, initialContent);
    }

    // Create Monaco binding (dynamic import to avoid SSR)
    const model = editor.getModel();
    if (model && provider.provider) {
      import('y-monaco').then(({ MonacoBinding }) => {
        bindingRef.current = new MonacoBinding(
          yText,
          model,
          new Set([editor]),
          provider.provider!.awareness
        );
        console.log('Monaco-Yjs binding created');
      });
    }

    // Track changes for save indicator
    editor.onDidChangeModelContent(() => {
      setHasChanges(true);
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!canEdit || !editorRef.current) {
      toast.error('You must acquire the file lock first');
      return;
    }

    const content = editorRef.current.getValue();

    setIsSaving(true);
    try {
      await onSave(content);
      setHasChanges(false);
      toast.success('Changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLock = async (): Promise<void> => {
    try {
      if (canEdit) {
        await onReleaseLock();
        toast.success('File lock released');
      } else if (!isLocked) {
        await onAcquireLock();
        toast.success('File lock acquired');
      } else {
        toast.error(`File is locked by ${lockedBy}`);
      }
    } catch (error) {
      toast.error('Failed to toggle lock');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <Card className="p-3 rounded-b-none border-b-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold truncate max-w-xs">{filePath}</h3>

          {activeUsers > 1 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {activeUsers} online
            </Badge>
          )}

          {isLocked && (
            <Badge
              variant={canEdit ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {canEdit ? (
                <>
                  <Lock className="h-3 w-3" />
                  You&apos;re editing
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Locked by {lockedBy}
                </>
              )}
            </Badge>
          )}

          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Unsaved changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleLock}
            disabled={isLocked && !canEdit && lockedBy !== null}
          >
            {canEdit ? (
              <>
                <LockOpen className="h-4 w-4 mr-1" />
                Release Lock
              </>
            ) : isLocked ? (
              <>
                <Lock className="h-4 w-4 mr-1" />
                Locked
              </>
            ) : (
              <>
                <LockOpen className="h-4 w-4 mr-1" />
                Acquire Lock
              </>
            )}
          </Button>

          {canEdit && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </Card>

      {/* Monaco Editor */}
      <Card className="flex-1 rounded-t-none overflow-hidden">
        <MonacoEditor
          height="100%"
          language={language}
          defaultValue={initialContent}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly: isReadOnly || !canEdit,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </Card>

      {/* Read-only Message */}
      {isReadOnly && (
        <Card className="p-3 mt-2 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <Eye className="inline h-4 w-4 mr-1" />
            This file is currently being edited by {lockedBy}. You can view changes in real-time but cannot edit.
          </p>
        </Card>
      )}
    </div>
  );
};
