'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Folder,
    File,
    ChevronRight,
    ChevronDown,
    Plus,
    Trash2,
    Lock,
    Unlock,
    Users
} from 'lucide-react';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    isLocked?: boolean;
    lockedBy?: string;
}

interface WorkspaceFileTreeProps {
    workspaceId: number;
    files: FileNode[];
    onFileSelect: (path: string) => void;
    onFileCreate: (path: string, type: 'file' | 'directory') => void;
    onFileDelete: (path: string) => void;
    onFileLockRequest: (path: string) => void;
    selectedFile?: string;
    currentUser: string;
}

export function WorkspaceFileTree({
    workspaceId,
    files,
    onFileSelect,
    onFileCreate,
    onFileDelete,
    onFileLockRequest,
    selectedFile,
    currentUser
}: WorkspaceFileTreeProps) {
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']));
    const [newFileName, setNewFileName] = useState('');
    const [showNewFile, setShowNewFile] = useState(false);

    const toggleDirectory = (path: string) => {
        const newExpanded = new Set(expandedDirs);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedDirs(newExpanded);
    };

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            onFileCreate(newFileName, 'file');
            setNewFileName('');
            setShowNewFile(false);
        }
    };

    const renderFileNode = (node: FileNode, depth: number = 0) => {
        const isExpanded = expandedDirs.has(node.path);
        const isSelected = selectedFile === node.path;
        const isLocked = node.isLocked && node.lockedBy !== currentUser;

        return (
            <div key={node.path}>
                <div
                    className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded ${isSelected ? 'bg-purple-100 dark:bg-purple-900/30' : ''
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => {
                        if (node.type === 'directory') {
                            toggleDirectory(node.path);
                        } else {
                            onFileSelect(node.path);
                        }
                    }}
                >
                    {node.type === 'directory' ? (
                        <>
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            <Folder className="h-4 w-4 text-yellow-600" />
                        </>
                    ) : (
                        <>
                            <div className="w-4" />
                            <File className="h-4 w-4 text-blue-600" />
                        </>
                    )}

                    <span className="flex-1 text-sm truncate">{node.name}</span>

                    {node.type === 'file' && (
                        <div className="flex items-center gap-1">
                            {node.isLocked ? (
                                <Badge variant="secondary" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    {node.lockedBy === currentUser ? 'You' : node.lockedBy}
                                </Badge>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFileLockRequest(node.path);
                                    }}
                                >
                                    <Unlock className="h-3 w-3" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileDelete(node.path);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>

                {node.type === 'directory' && isExpanded && node.children && (
                    <div>
                        {node.children.map(child => renderFileNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Files</CardTitle>
                    <Button
                        size="sm"
                        onClick={() => setShowNewFile(true)}
                        className="h-8"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        New File
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                    <div className="p-2">
                        {showNewFile && (
                            <div className="flex gap-2 mb-2 px-2">
                                <Input
                                    placeholder="filename.ext"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateFile();
                                        if (e.key === 'Escape') setShowNewFile(false);
                                    }}
                                    className="h-8 text-sm"
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleCreateFile} className="h-8">
                                    Create
                                </Button>
                            </div>
                        )}
                        {files.map(node => renderFileNode(node))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
