import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export interface CompetitionRoom {
    competitionId: number;
    participants: Set<string>;
    startTime?: Date;
    endTime?: Date;
}

export interface WorkspaceRoom {
    workspaceId: number;
    members: Map<string, { userId: string; username: string; isOnline: boolean }>;
    fileLocks: Map<string, { userId: string; timestamp: number }>;
}

export class WebSocketServer {
    private io: SocketIOServer;
    private redis: Redis;
    private competitions: Map<number, CompetitionRoom> = new Map();
    private workspaces: Map<number, WorkspaceRoom> = new Map();

    constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        // Redis adapter for horizontal scaling
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.redis = new Redis(redisUrl);
        const pubClient = new Redis(redisUrl);
        const subClient = pubClient.duplicate();

        this.io.adapter(createAdapter(pubClient, subClient));

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`Client connected: ${socket.id}`);

            // Authentication
            socket.on('authenticate', async (data: { userId: string; username: string }) => {
                socket.data.userId = data.userId;
                socket.data.username = data.username;
                socket.emit('authenticated', { success: true });
            });

            // Competition events
            socket.on('join-competition', (data: { competitionId: number }) => {
                this.handleJoinCompetition(socket, data.competitionId);
            });

            socket.on('leave-competition', (data: { competitionId: number }) => {
                this.handleLeaveCompetition(socket, data.competitionId);
            });

            socket.on('submit-code', async (data: { competitionId: number; questionId: number; code: string }) => {
                await this.handleCodeSubmission(socket, data);
            });

            // Workspace events
            socket.on('join-workspace', (data: { workspaceId: number }) => {
                this.handleJoinWorkspace(socket, data.workspaceId);
            });

            socket.on('leave-workspace', (data: { workspaceId: number }) => {
                this.handleLeaveWorkspace(socket, data.workspaceId);
            });

            socket.on('request-file-lock', (data: { workspaceId: number; filePath: string }) => {
                this.handleFileLockRequest(socket, data);
            });

            socket.on('release-file-lock', (data: { workspaceId: number; filePath: string }) => {
                this.handleFileLockRelease(socket, data);
            });

            socket.on('file-change', (data: { workspaceId: number; filePath: string; content: string }) => {
                this.handleFileChange(socket, data);
            });

            socket.on('workspace-chat', (data: { workspaceId: number; message: string }) => {
                this.handleWorkspaceChat(socket, data);
            });

            // Heartbeat
            socket.on('heartbeat', () => {
                socket.emit('heartbeat-ack', { timestamp: Date.now() });
            });

            // Disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    // Competition handlers
    private handleJoinCompetition(socket: Socket, competitionId: number) {
        const roomName = `competition:${competitionId}`;
        socket.join(roomName);

        if (!this.competitions.has(competitionId)) {
            this.competitions.set(competitionId, {
                competitionId,
                participants: new Set(),
            });
        }

        const room = this.competitions.get(competitionId)!;
        room.participants.add(socket.data.userId);

        // Notify others
        this.io.to(roomName).emit('participant-joined', {
            userId: socket.data.userId,
            username: socket.data.username,
            participantCount: room.participants.size,
        });
    }

    private handleLeaveCompetition(socket: Socket, competitionId: number) {
        const roomName = `competition:${competitionId}`;
        socket.leave(roomName);

        const room = this.competitions.get(competitionId);
        if (room) {
            room.participants.delete(socket.data.userId);
            this.io.to(roomName).emit('participant-left', {
                userId: socket.data.userId,
                participantCount: room.participants.size,
            });
        }
    }

    private async handleCodeSubmission(socket: Socket, data: { competitionId: number; questionId: number; code: string }) {
        const roomName = `competition:${data.competitionId}`;

        // Broadcast submission event (without code for privacy)
        this.io.to(roomName).emit('submission-received', {
            userId: socket.data.userId,
            username: socket.data.username,
            questionId: data.questionId,
            timestamp: Date.now(),
        });
    }

    // Workspace handlers
    private handleJoinWorkspace(socket: Socket, workspaceId: number) {
        const roomName = `workspace:${workspaceId}`;
        socket.join(roomName);

        if (!this.workspaces.has(workspaceId)) {
            this.workspaces.set(workspaceId, {
                workspaceId,
                members: new Map(),
                fileLocks: new Map(),
            });
        }

        const workspace = this.workspaces.get(workspaceId)!;
        workspace.members.set(socket.id, {
            userId: socket.data.userId,
            username: socket.data.username,
            isOnline: true,
        });

        // Notify others
        this.io.to(roomName).emit('member-joined', {
            userId: socket.data.userId,
            username: socket.data.username,
            members: Array.from(workspace.members.values()),
        });

        // Send current file locks to new member
        socket.emit('file-locks-state', {
            locks: Array.from(workspace.fileLocks.entries()).map(([path, lock]) => ({
                filePath: path,
                lockedBy: lock.userId,
            })),
        });
    }

    private handleLeaveWorkspace(socket: Socket, workspaceId: number) {
        const roomName = `workspace:${workspaceId}`;
        socket.leave(roomName);

        const workspace = this.workspaces.get(workspaceId);
        if (workspace) {
            workspace.members.delete(socket.id);
            this.io.to(roomName).emit('member-left', {
                userId: socket.data.userId,
                members: Array.from(workspace.members.values()),
            });
        }
    }

    private handleFileLockRequest(socket: Socket, data: { workspaceId: number; filePath: string }) {
        const workspace = this.workspaces.get(data.workspaceId);
        if (!workspace) return;

        const existingLock = workspace.fileLocks.get(data.filePath);

        if (existingLock && existingLock.userId !== socket.data.userId) {
            // File is locked by someone else
            socket.emit('file-lock-denied', {
                filePath: data.filePath,
                lockedBy: existingLock.userId,
            });
            return;
        }

        // Grant lock
        workspace.fileLocks.set(data.filePath, {
            userId: socket.data.userId,
            timestamp: Date.now(),
        });

        const roomName = `workspace:${data.workspaceId}`;
        this.io.to(roomName).emit('file-locked', {
            filePath: data.filePath,
            lockedBy: socket.data.userId,
            username: socket.data.username,
        });

        // Auto-release after 5 minutes of inactivity
        setTimeout(() => {
            const currentLock = workspace.fileLocks.get(data.filePath);
            if (currentLock && currentLock.userId === socket.data.userId) {
                this.handleFileLockRelease(socket, data);
            }
        }, 5 * 60 * 1000);
    }

    private handleFileLockRelease(socket: Socket, data: { workspaceId: number; filePath: string }) {
        const workspace = this.workspaces.get(data.workspaceId);
        if (!workspace) return;

        workspace.fileLocks.delete(data.filePath);

        const roomName = `workspace:${data.workspaceId}`;
        this.io.to(roomName).emit('file-unlocked', {
            filePath: data.filePath,
        });
    }

    private handleFileChange(socket: Socket, data: { workspaceId: number; filePath: string; content: string }) {
        const roomName = `workspace:${data.workspaceId}`;

        // Broadcast to others (not sender)
        socket.to(roomName).emit('file-changed', {
            filePath: data.filePath,
            content: data.content,
            changedBy: socket.data.userId,
        });
    }

    private handleWorkspaceChat(socket: Socket, data: { workspaceId: number; message: string }) {
        const roomName = `workspace:${data.workspaceId}`;

        this.io.to(roomName).emit('chat-message', {
            userId: socket.data.userId,
            username: socket.data.username,
            message: data.message,
            timestamp: Date.now(),
        });
    }

    private handleDisconnect(socket: Socket) {
        console.log(`Client disconnected: ${socket.id}`);

        // Clean up workspace memberships
        this.workspaces.forEach((workspace, workspaceId) => {
            if (workspace.members.has(socket.id)) {
                workspace.members.delete(socket.id);

                // Release any file locks held by this user
                workspace.fileLocks.forEach((lock, filePath) => {
                    if (lock.userId === socket.data.userId) {
                        workspace.fileLocks.delete(filePath);
                        this.io.to(`workspace:${workspaceId}`).emit('file-unlocked', { filePath });
                    }
                });

                this.io.to(`workspace:${workspaceId}`).emit('member-left', {
                    userId: socket.data.userId,
                    members: Array.from(workspace.members.values()),
                });
            }
        });

        // Clean up competition participation
        this.competitions.forEach((competition, competitionId) => {
            if (competition.participants.has(socket.data.userId)) {
                competition.participants.delete(socket.data.userId);
                this.io.to(`competition:${competitionId}`).emit('participant-left', {
                    userId: socket.data.userId,
                    participantCount: competition.participants.size,
                });
            }
        });
    }

    public broadcastCompetitionStart(competitionId: number, startTime: Date) {
        const roomName = `competition:${competitionId}`;
        this.io.to(roomName).emit('competition-started', {
            competitionId,
            startTime,
        });
    }

    public broadcastCompetitionEnd(competitionId: number, results: any) {
        const roomName = `competition:${competitionId}`;
        this.io.to(roomName).emit('competition-ended', {
            competitionId,
            results,
        });
    }
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketServer {
    if (!wsServer) {
        wsServer = new WebSocketServer(httpServer);
    }
    return wsServer;
}

export function getWebSocketServer(): WebSocketServer | null {
    return wsServer;
}
