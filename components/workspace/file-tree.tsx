'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Lock,
  Eye,
  Circle,
  Plus,
  FolderGit2,
  MoreHorizontal,
  FileCode2,
  FileJson,
  FileType,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const getFileIcon = (filename: string) => {
  if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return <FileCode2 className="h-4 w-4 text-blue-400" />;
  if (filename.endsWith('.json')) return <FileJson className="h-4 w-4 text-yellow-400" />;
  if (filename.endsWith('.css')) return <FileType className="h-4 w-4 text-blue-300" />;
  if (filename.match(/\.(png|jpg|jpeg|gif|svg)$/)) return <ImageIcon className="h-4 w-4 text-purple-400" />;
  return <File className="h-4 w-4 text-gray-400" />;
};

const FileTreeNode: React.FC<{
  node: FileNode;
  level: number;
  currentUser: string;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  onNewFile?: (path: string) => void;
  onNewFolder?: (path: string) => void;
}> = ({
  node,
  level,
  currentUser,
  selectedPath,
  onSelectFile,
  onNewFile,
  onNewFolder
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const isSelected = selectedPath === node.path;
    const isFolder = node.type === 'folder';
    const isLockedByMe = node.isLocked && node.lockedBy === currentUser;
    const isLockedByOther = node.isLocked && node.lockedBy !== currentUser;

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        setIsExpanded(!isExpanded);
      } else {
        onSelectFile(node.path);
      }
    };

    return (
      <div className="select-none">
        <div
          className={cn(
            "flex items-center gap-1 py-0.5 px-2 cursor-pointer hover:bg-[#2a2d2e] text-[#cccccc] text-[13px]",
            isSelected && "bg-[#37373d] text-white focus:bg-[#094771]"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={handleToggle}
        >
          {/* Indent Guide (Visual only) */}

          {/* Toggle Icon */}
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            {isFolder && (
              isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
            )}
          </div>

          {/* File/Folder Icon */}
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            {isFolder ? (
              isExpanded ? <FolderGit2 className="h-4 w-4 text-[#C69A5E]" /> : <Folder className="h-4 w-4 text-[#C69A5E]" />
            ) : (
              getFileIcon(node.name)
            )}
          </div>

          {/* Name */}
          <span className="truncate flex-1 font-normal opacity-90">{node.name}</span>

          {/* Actions (Hover) */}
          <div className="hidden group-hover:flex items-center gap-1">
            {isFolder && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-[#454545]">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 bg-[#252526] text-[#cccccc] border-[#454545]">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onNewFile?.(node.path); }}>
                    <Plus className="h-3 w-3 mr-2" /> New File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onNewFolder?.(node.path); }}>
                    <FolderGit2 className="h-3 w-3 mr-2" /> New Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Lock Status */}
          {isLockedByMe && <Circle className="h-2 w-2 text-green-500 fill-current" />}
          {isLockedByOther && <Eye className="h-3 w-3 text-orange-400" title={`Edited by ${node.lockedBy}`} />}
        </div>

        {/* Children */}
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => (
              <FileTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                currentUser={currentUser}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
                onNewFile={onNewFile}
                onNewFolder={onNewFolder}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  currentUser,
  onSelectFile,
  selectedPath,
  onNewFile,
  onNewFolder,
}) => {
  return (
    <div className="w-full">
      {files.length === 0 && (
        <div className="p-4 text-xs text-center text-[#6e7681]">
          No files found.
        </div>
      )}
      {files.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          level={0}
          currentUser={currentUser}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
          onNewFile={onNewFile}
          onNewFolder={onNewFolder}
        />
      ))}
    </div>
  );
};

