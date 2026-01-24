'use client';

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, LockOpen, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CollaborativeEditorProps {
  workspaceId: number;
  filePath: string;
  fileContent: string;
  language: string;
  isLocked: boolean;
  lockedBy: string | null;
  currentUsername: string;
  onSave: (content: string) => Promise<void>;
  onAcquireLock: () => Promise<void>;
  onReleaseLock: () => Promise<void>;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  workspaceId,
  filePath,
  fileContent,
  language,
  isLocked,
  lockedBy,
  currentUsername,
  onSave,
  onAcquireLock,
  onReleaseLock,
}) => {
  const [content, setContent] = useState<string>(fileContent);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const canEdit = isLocked && lockedBy === currentUsername;
  const isReadOnly = isLocked && lockedBy !== currentUsername;

  useEffect(() => {
    setContent(fileContent);
    setHasChanges(false);
  }, [fileContent, filePath]);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ): void => {
    editorRef.current = editor;
  };

  const handleContentChange = (value: string | undefined): void => {
    if (value !== undefined) {
      setContent(value);
      setHasChanges(value !== fileContent);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!canEdit) {
      toast.error('You must acquire the file lock first');
      return;
    }

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
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleContentChange}
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
