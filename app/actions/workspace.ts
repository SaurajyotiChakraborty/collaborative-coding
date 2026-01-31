'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { GitOperations } from '@/lib/git-operations'
import { RunnerService } from '@/lib/runner-service'
import path from 'path'
import fs from 'fs/promises'

export async function pushToGit(workspaceId: number, commitMessage: string) {
    try {
        const workspace = await prisma.workspaceGroup.findUnique({
            where: { id: workspaceId },
            include: { leader: true }
        });

        if (!workspace) return { success: false, error: 'Workspace not found' };

        const git = new GitOperations();
        const result = await git.pushToRepository(
            {
                repoUrl: workspace.gitRepoUrl,
                branch: workspace.gitBranch,
                workspaceId: workspaceId.toString(),
            },
            commitMessage,
            workspace.cloudStoragePath
        );

        return result;
    } catch (error) {
        console.error('Git push error:', error);
        return { success: false, error: 'Failed to push to Git' };
    }
}

export async function pullFromGit(workspaceId: number) {
    try {
        const workspace = await prisma.workspaceGroup.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace) return { success: false, error: 'Workspace not found' };

        const git = new GitOperations();
        const result = await git.pullFromRepository({
            repoUrl: workspace.gitRepoUrl,
            branch: workspace.gitBranch,
            workspaceId: workspaceId.toString()
        });

        if (result.success) {
            revalidatePath('/workspace');
        }

        return result;
    } catch (error) {
        console.error('Git pull error:', error);
        return { success: false, error: 'Failed to pull from Git' };
    }
}

export async function createWorkspace(data: {
    name: string;
    leaderId: string;
    gitRepoUrl: string;
    gitBranch: string;
}) {
    try {
        console.log('[WorkspaceAction] Creating workspace:', JSON.stringify(data));

        // Verify user exists to prevent P2003
        const userExists = await prisma.user.findUnique({
            where: { id: data.leaderId },
            select: { id: true, isCheater: true }
        });

        if (!userExists) {
            console.error(`[WorkspaceAction] Leader ID ${data.leaderId} not found in database.`);
            return {
                success: false,
                error: 'Your session might be stale. Please log out and log back in to sync your account.'
            };
        }

        if (userExists.isCheater) {
            return {
                success: false,
                error: 'Your account is restricted from creating workspaces.'
            };
        }

        const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const workspace = await prisma.workspaceGroup.create({
            data: {
                name: data.name,
                leaderId: data.leaderId,
                gitRepoUrl: data.gitRepoUrl,
                gitBranch: data.gitBranch,
                inviteCode,
                cloudStoragePath: `/workspaces/${inviteCode}`,
                members: {
                    create: {
                        userId: data.leaderId,
                        role: 'Leader',
                        gitUsername: 'leader',
                        isOnline: true
                    }
                }
            },
            include: {
                members: true,
                leader: true
            }
        })

        // Sync Git Repository
        try {
            // Get GitHub Token
            const account = await prisma.account.findFirst({
                where: { userId: data.leaderId, provider: 'github' }
            });

            const git = new GitOperations();
            const cloneResult = await git.cloneRepository({
                repoUrl: data.gitRepoUrl,
                branch: data.gitBranch,
                workspaceId: workspace.id.toString(),
                githubToken: account?.access_token || undefined
            });

            if (cloneResult.success && cloneResult.files) {
                // Bulk insert files
                await prisma.$transaction(
                    cloneResult.files.map(file =>
                        prisma.workspaceFile.create({
                            data: {
                                workspaceId: workspace.id,
                                filePath: file.path,
                                content: typeof file.content === 'string' ? file.content : '', // Handle buffer if binary
                                lastModifiedById: data.leaderId
                            }
                        })
                    )
                );
            }
        } catch (error) {
            console.error('Git sync failed during workspace creation:', error);
            // Don't fail the whole creation, just log invalid sync
        }

        revalidatePath('/workspace')
        return { success: true, workspace }
    } catch (error) {
        console.error('Failed to create workspace:', error)
        return { success: false, error: 'Failed to create workspace' }
    }
}

export async function joinWorkspace(inviteCode: string, userId: string, gitUsername: string) {
    try {
        const workspace = await prisma.workspaceGroup.findUnique({
            where: { inviteCode },
            include: { members: true }
        })

        if (!workspace) {
            return { success: false, error: 'Invalid invite code' }
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isCheater: true }
        });

        if (user?.isCheater) {
            return { success: false, error: 'Your account is restricted from joining workspaces.' };
        }

        if (workspace.status !== 'Active') {
            return { success: false, error: 'Workspace is not active' }
        }

        await prisma.workspaceMember.create({
            data: {
                workspaceId: workspace.id,
                userId,
                role: 'Contributor',
                gitUsername,
                isOnline: true
            }
        })

        revalidatePath('/workspace')
        return { success: true, workspace }
    } catch (error) {
        return { success: false, error: 'Failed to join workspace' }
    }
}

export async function getWorkspace(workspaceId: number) {
    try {
        const workspace = await prisma.workspaceGroup.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    include: { user: true }
                },
                files: {
                    orderBy: { filePath: 'asc' }
                },
                locks: {
                    include: { lockedBy: true }
                },
                chats: {
                    orderBy: { timestamp: 'asc' },
                    take: 100
                }
            }
        })

        if (!workspace) {
            return { success: false, error: 'Workspace not found' }
        }

        return { success: true, workspace }
    } catch (error) {
        return { success: false, error: 'Failed to fetch workspace' }
    }
}

export async function createFile(workspaceId: number, filePath: string, userId: string) {
    try {
        await prisma.workspaceFile.create({
            data: {
                workspaceId,
                filePath,
                content: '',
                lastModifiedById: userId
            }
        })

        revalidatePath('/workspace')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to create file' }
    }
}

export async function updateFile(workspaceId: number, filePath: string, content: string, userId: string) {
    try {
        await prisma.workspaceFile.upsert({
            where: {
                workspaceId_filePath: {
                    workspaceId,
                    filePath
                }
            },
            create: {
                workspaceId,
                filePath,
                content,
                lastModifiedById: userId
            },
            update: {
                content,
                lastModifiedById: userId,
                version: { increment: 1 }
            }
        })

        revalidatePath('/workspace')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update file' }
    }
}

export async function deleteFile(workspaceId: number, filePath: string) {
    try {
        await prisma.workspaceFile.delete({
            where: {
                workspaceId_filePath: {
                    workspaceId,
                    filePath
                }
            }
        })

        revalidatePath('/workspace')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete file' }
    }
}
export async function getMyWorkspaces(userId: string) {
    try {
        const workspaces = await prisma.workspaceGroup.findMany({
            where: {
                OR: [
                    { leaderId: userId },
                    { members: { some: { userId } } }
                ]
            },
            include: {
                members: {
                    include: { user: true }
                },
                _count: {
                    select: { members: true, files: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, workspaces };
    } catch (error) {
        console.error('Failed to fetch workspaces:', error);
        return { success: false, error: 'Failed to fetch workspaces' };
    }
}

export async function sendWorkspaceMessage(workspaceId: number, userId: string, username: string, message: string) {
    try {
        const chat = await prisma.workspaceChat.create({
            data: {
                workspaceId,
                userId,
                username,
                message,
                timestamp: new Date()
            }
        });

        return { success: true, chat };
    } catch (error) {
        console.error('Failed to save message:', error);
        return { success: false, error: 'Failed to save message' };
    }
}

export async function lockWorkspaceFile(workspaceId: number, filePath: string, userId: string) {
    try {
        const existingLock = await prisma.fileLock.findFirst({
            where: {
                workspaceId,
                filePath,
                NOT: { lockedById: userId }
            }
        });

        if (existingLock) {
            return { success: false, error: 'File is already locked by another user' };
        }

        // We need a unique constraint or use upsert with specific fields
        // Since schema doesn't have a unique constraint on workspaceId_filePath for FileLock yet (only workspace_files)
        // I'll check and then create/update.
        const myLock = await prisma.fileLock.findFirst({
            where: { workspaceId, filePath, lockedById: userId }
        });

        if (myLock) {
            await prisma.fileLock.update({
                where: { id: myLock.id },
                data: { lastActivity: new Date() }
            });
            return { success: true, lock: myLock };
        }

        const lock = await prisma.fileLock.create({
            data: {
                workspaceId,
                filePath,
                lockedById: userId,
                lastActivity: new Date()
            }
        });

        return { success: true, lock };
    } catch (error) {
        console.error('Failed to lock file:', error);
        return { success: false, error: 'Failed to lock file' };
    }
}

export async function unlockWorkspaceFile(workspaceId: number, filePath: string, userId: string) {
    try {
        await prisma.fileLock.deleteMany({
            where: {
                workspaceId,
                filePath,
                lockedById: userId
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to unlock file:', error);
        return { success: false, error: 'Failed to unlock file' };
    }
}

export async function startWorkspaceSession(workspaceId: number) {
    try {
        const workspace = await prisma.workspaceGroup.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace) return { success: false, error: 'Workspace not found' };

        // Define local storage path for Docker mount
        // Using a directory inside the project for now, or /tmp/workspaces
        // const storageRoot = path.join(process.cwd(), 'workspace-storage'); // This might be inside the app, safer to use temp or distinct drive
        const storageRoot = process.env.WORKSPACE_STORAGE_ROOT || path.join(process.cwd(), '..', 'workspace-data');
        const workspacePath = path.join(storageRoot, workspaceId.toString());

        await fs.mkdir(storageRoot, { recursive: true });

        const git = new GitOperations();
        let isValidRepo = false;
        try {
            // Check if .git directory exists to confirm it's a valid repo
            await fs.access(path.join(workspacePath, '.git'));
            isValidRepo = true;
        } catch { }

        if (isValidRepo) {
            console.log(`Workspace ${workspaceId} repo exists and is valid at ${workspacePath}`);
            // Optional: Try to pull latest changes here?
            // For now, we assume if it exists, it's good, to avoid conflicts/merges on startup.
        } else {
            // If directory exists but invalid (empty or broken), clean it up
            try {
                await fs.rm(workspacePath, { recursive: true, force: true });
            } catch { }

            // Clone fresh
            console.log(`Cloning workspace ${workspaceId} to ${workspacePath}...`);

            const account = await prisma.account.findFirst({
                where: { userId: workspace.leaderId, provider: 'github' }
            });

            const cloneResult = await git.cloneRepository({
                repoUrl: workspace.gitRepoUrl,
                branch: workspace.gitBranch,
                workspaceId: workspaceId.toString(),
                githubToken: account?.access_token || undefined,
                targetDir: workspacePath,
                preserve: true
            });

            if (!cloneResult.success) {
                console.error('Clone failed:', cloneResult.error);
                return { success: false, error: `Failed to clone repository: ${cloneResult.error}` };
            }
        }

        const runner = new RunnerService();
        const containerInfo = await runner.spawnContainer({
            workspaceId: workspaceId.toString(),
            projectPath: workspacePath
        });

        // Save containerId to DB using raw query to bypass stale client validation
        await prisma.$executeRawUnsafe(
            'UPDATE workspace_groups SET "containerId" = $1 WHERE id = $2',
            containerInfo.containerId,
            workspaceId
        );

        return { success: true, url: containerInfo.url };

    } catch (error) {
        console.error('Failed to start workspace session:', error);
        return { success: false, error: 'Failed to start workspace session' };
    }
}

export async function stopWorkspaceSession(workspaceId: number) {
    try {
        const result: any[] = await prisma.$queryRawUnsafe(
            'SELECT "containerId", "leaderId" FROM workspace_groups WHERE id = $1',
            workspaceId
        );
        const workspace = result[0];

        if (!workspace) return { success: false, error: 'Workspace not found' };

        if ((workspace as any).containerId) {
            const runner = new RunnerService();
            await runner.stopContainer((workspace as any).containerId);

            // Clear containerId in DB using raw query
            await prisma.$executeRawUnsafe(
                'UPDATE workspace_groups SET "containerId" = NULL WHERE id = $1',
                workspaceId
            );
        }

        revalidatePath('/workspace');
        return { success: true };

    } catch (error) {
        console.error('Failed to stop workspace session:', error);
        return { success: false, error: 'Failed to stop workspace session' };
    }
}
