'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createWorkspace(data: {
    name: string;
    leaderId: string;
    gitRepoUrl: string;
    gitBranch: string;
}) {
    try {
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
