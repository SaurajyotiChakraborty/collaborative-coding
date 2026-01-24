'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Lock, Eye, Circle, Plus, FolderGit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isLocked?: boolean;
  lockedBy?: string;
}

interface FileTreeProps {
  files: FileNode[];
  currentUser: string;
  onSelectFile: (path: string) => void;
  selectedPath: string | null;
  onNewFile?: (parentPath: string) => void;
  onNewFolder?: (parentPath: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  currentUser,
  onSelectFile,
  selectedPath,
  onNewFile,
  onNewFolder,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['/'])
  );

  const toggleFolder = (path: string): void => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderNode = (node: FileNode, level: number = 0): React.ReactElement => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedPath === node.path;
    const isFolder = node.type === 'folder';
    const isLockedByMe = node.isLocked && node.lockedBy === currentUser;
    const isLockedByOther = node.isLocked && node.lockedBy !== currentUser;

    return (
      <div key={node.path} className="group/node">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-xs py-1.5 px-2 hover:bg-[#37373d]',
            isSelected && 'bg-[#37373d] text-white',
            level > 0 && 'ml-' + (level * 4)
          )}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              onSelectFile(node.path);
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Folder/File Icon */}
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                )}
                <Folder className="h-4 w-4 flex-shrink-0 text-yellow-600" />
              </>
            ) : (
              <>
                <span className="w-3" />
                <File className="h-4 w-4 flex-shrink-0 text-blue-400" />
              </>
            )}

            {/* File Name */}
            <span className="truncate flex-1 text-[#cccccc]">{node.name}</span>

            {/* Folder Actions */}
            {isFolder && (
              <div className="hidden group-hover/node:flex items-center gap-1.5 px-1 animate-in fade-in">
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); onNewFile?.(node.path); }}
                  className="hover:bg-[#454545] p-0.5 rounded cursor-pointer"
                  title="New File"
                >
                  <Plus className="h-3 w-3" />
                </span>
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); onNewFolder?.(node.path); }}
                  className="hover:bg-[#454545] p-0.5 rounded cursor-pointer"
                  title="New Folder"
                >
                  <FolderGit2 className="h-3 w-3" />
                </span>
              </div>
            )}

            {/* Lock Indicators */}
            {!isFolder && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {isLockedByMe && (
                  <div className="flex items-center gap-1" title="You're editing">
                    <Lock className="h-3 w-3 text-green-600" />
                    <Circle className="h-2 w-2 text-green-600 animate-pulse" />
                  </div>
                )}
                {isLockedByOther && (
                  <div
                    className="flex items-center gap-1"
                    title={`Locked by ${node.lockedBy}`}
                  >
                    <Eye className="h-3 w-3 text-orange-600" />
                  </div>
                )}
                {!node.isLocked && (
                  <div title="Available">
                    <Circle className="h-2 w-2 text-green-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        </Button>

        {/* Render children if folder is expanded */}
        {isFolder && isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {files.map((node) => renderNode(node))}
    </div>
  );
};
