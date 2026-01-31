const { createServer } = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const PORT = process.env.WS_PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CLIENT_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

// Redis clients for pub/sub
const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error('[WS] Redis PubClient Error:', err));
subClient.on('error', (err) => console.error('[WS] Redis SubClient Error:', err));

// Redis adapter for scaling
const { createAdapter } = require('@socket.io/redis-adapter');
io.adapter(createAdapter(pubClient, subClient));

// Store active rooms
const competitions = new Map();
const workspaces = new Map();

io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Authentication
    socket.on('authenticate', (data) => {
        socket.data.userId = data.userId;
        socket.data.username = data.username;
        socket.emit('authenticated', { success: true });
        console.log(`[WS] User authenticated: ${data.username}`);
    });

    // Competition events
    socket.on('join-competition', (data) => {
        const roomName = `competition:${data.competitionId}`;
        socket.join(roomName);

        if (!competitions.has(data.competitionId)) {
            competitions.set(data.competitionId, new Set());
        }
        competitions.get(data.competitionId).add(socket.data.userId);

        io.to(roomName).emit('participant-joined', {
            userId: socket.data.userId,
            username: socket.data.username,
            participantCount: competitions.get(data.competitionId).size,
        });
        console.log(`[WS] User ${socket.data.username} joined competition ${data.competitionId}`);
    });

    socket.on('leave-competition', (data) => {
        const roomName = `competition:${data.competitionId}`;
        socket.leave(roomName);

        const comp = competitions.get(data.competitionId);
        if (comp) {
            comp.delete(socket.data.userId);
            io.to(roomName).emit('participant-left', {
                userId: socket.data.userId,
                participantCount: comp.size,
            });
        }
    });

    socket.on('submit-code', (data) => {
        const roomName = `competition:${data.competitionId}`;
        io.to(roomName).emit('submission-received', {
            userId: socket.data.userId,
            username: socket.data.username,
            questionId: data.questionId,
            timestamp: Date.now(),
        });
        console.log(`[WS] Code submitted by ${socket.data.username} in competition ${data.competitionId}`);
    });

    // Workspace events
    socket.on('join-workspace', (data) => {
        const roomName = `workspace:${data.workspaceId}`;
        socket.join(roomName);

        if (!workspaces.has(data.workspaceId)) {
            workspaces.set(data.workspaceId, {
                members: new Map(),
                fileLocks: new Map(),
            });
        }

        const workspace = workspaces.get(data.workspaceId);
        workspace.members.set(socket.id, {
            userId: socket.data.userId,
            username: socket.data.username,
            isOnline: true,
        });

        io.to(roomName).emit('member-joined', {
            userId: socket.data.userId,
            username: socket.data.username,
            members: Array.from(workspace.members.values()),
        });

        // Send current file locks
        socket.emit('file-locks-state', {
            locks: Array.from(workspace.fileLocks.entries()).map(([path, lock]) => ({
                filePath: path,
                lockedBy: lock.userId,
            })),
        });
    });

    socket.on('request-file-lock', (data) => {
        const workspace = workspaces.get(data.workspaceId);
        if (!workspace) return;

        const existingLock = workspace.fileLocks.get(data.filePath);
        if (existingLock && existingLock.userId !== socket.data.userId) {
            socket.emit('file-lock-denied', {
                filePath: data.filePath,
                lockedBy: existingLock.userId,
            });
            return;
        }

        workspace.fileLocks.set(data.filePath, {
            userId: socket.data.userId,
            timestamp: Date.now(),
        });

        const roomName = `workspace:${data.workspaceId}`;
        io.to(roomName).emit('file-locked', {
            filePath: data.filePath,
            lockedBy: socket.data.userId,
            username: socket.data.username,
        });

        // Auto-release after 5 minutes
        setTimeout(() => {
            const currentLock = workspace.fileLocks.get(data.filePath);
            if (currentLock && currentLock.userId === socket.data.userId) {
                workspace.fileLocks.delete(data.filePath);
                io.to(roomName).emit('file-unlocked', { filePath: data.filePath });
            }
        }, 5 * 60 * 1000);
    });

    socket.on('release-file-lock', (data) => {
        const workspace = workspaces.get(data.workspaceId);
        if (!workspace) return;

        workspace.fileLocks.delete(data.filePath);
        const roomName = `workspace:${data.workspaceId}`;
        io.to(roomName).emit('file-unlocked', { filePath: data.filePath });
    });

    socket.on('file-change', (data) => {
        const roomName = `workspace:${data.workspaceId}`;
        socket.to(roomName).emit('file-changed', {
            filePath: data.filePath,
            content: data.content,
            changedBy: socket.data.userId,
        });
    });

    socket.on('workspace-chat', (data) => {
        const roomName = `workspace:${data.workspaceId}`;
        io.to(roomName).emit('chat-message', {
            userId: socket.data.userId,
            username: socket.data.username,
            message: data.message,
            timestamp: Date.now(),
        });
    });

    // WebRTC Signaling for Voice/Video Calls
    socket.on('call-user', (data) => {
        // Broadcoast to the room that someone wants to call
        // In a real 1-on-1, you'd target a specific socket.id, 
        // but for a group call, we'll notify the room.
        socket.to(`workspace:${data.workspaceId}`).emit('incoming-call', {
            from: socket.data.userId,
            username: socket.data.username,
            offer: data.offer,
        });
    });

    socket.on('answer-call', (data) => {
        socket.to(`workspace:${data.workspaceId}`).emit('call-accepted', {
            from: socket.data.userId,
            answer: data.answer,
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(`workspace:${data.workspaceId}`).emit('ice-candidate', {
            from: socket.data.userId,
            candidate: data.candidate,
        });
    });

    // Heartbeat
    socket.on('heartbeat', () => {
        socket.emit('heartbeat-ack', { timestamp: Date.now() });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`[WS] Client disconnected: ${socket.id}`);

        // Clean up workspaces
        workspaces.forEach((workspace, workspaceId) => {
            if (workspace.members.has(socket.id)) {
                workspace.members.delete(socket.id);

                // Release file locks
                workspace.fileLocks.forEach((lock, filePath) => {
                    if (lock.userId === socket.data.userId) {
                        workspace.fileLocks.delete(filePath);
                        io.to(`workspace:${workspaceId}`).emit('file-unlocked', { filePath });
                    }
                });

                io.to(`workspace:${workspaceId}`).emit('member-left', {
                    userId: socket.data.userId,
                    members: Array.from(workspace.members.values()),
                });
            }
        });

        // Clean up competitions
        competitions.forEach((participants, competitionId) => {
            if (participants.has(socket.data.userId)) {
                participants.delete(socket.data.userId);
                io.to(`competition:${competitionId}`).emit('participant-left', {
                    userId: socket.data.userId,
                    participantCount: participants.size,
                });
            }
        });
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on port ${PORT}`);
    console.log(`📡 Redis connected to ${REDIS_URL}`);
    console.log(`🔗 Accepting connections from ${CLIENT_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    httpServer.close(() => {
        pubClient.quit();
        subClient.quit();
        process.exit(0);
    });
});
