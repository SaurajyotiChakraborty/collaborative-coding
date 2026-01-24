import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
    userId?: string;
    username?: string;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: maxReconnectAttempts,
        });

        newSocket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            reconnectAttempts.current = 0;

            // Authenticate if user info provided
            if (options.userId && options.username) {
                newSocket.emit('authenticate', {
                    userId: options.userId,
                    username: options.username,
                });
            }
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            reconnectAttempts.current++;

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
            }
        });

        setSocket(newSocket);

        // Heartbeat
        const heartbeatInterval = setInterval(() => {
            if (newSocket.connected) {
                newSocket.emit('heartbeat');
            }
        }, 30000); // Every 30 seconds

        return () => {
            clearInterval(heartbeatInterval);
            newSocket.close();
        };
    }, [options.userId, options.username]);

    const joinCompetition = useCallback((competitionId: number) => {
        socket?.emit('join-competition', { competitionId });
    }, [socket]);

    const leaveCompetition = useCallback((competitionId: number) => {
        socket?.emit('leave-competition', { competitionId });
    }, [socket]);

    const submitCode = useCallback((data: { competitionId: number; questionId: number; code: string }) => {
        socket?.emit('submit-code', data);
    }, [socket]);

    const joinWorkspace = useCallback((workspaceId: number) => {
        socket?.emit('join-workspace', { workspaceId });
    }, [socket]);

    const leaveWorkspace = useCallback((workspaceId: number) => {
        socket?.emit('leave-workspace', { workspaceId });
    }, [socket]);

    const requestFileLock = useCallback((workspaceId: number, filePath: string) => {
        socket?.emit('request-file-lock', { workspaceId, filePath });
    }, [socket]);

    const releaseFileLock = useCallback((workspaceId: number, filePath: string) => {
        socket?.emit('release-file-lock', { workspaceId, filePath });
    }, [socket]);

    const sendFileChange = useCallback((workspaceId: number, filePath: string, content: string) => {
        socket?.emit('file-change', { workspaceId, filePath, content });
    }, [socket]);

    const sendChatMessage = useCallback((workspaceId: number, message: string) => {
        socket?.emit('workspace-chat', { workspaceId, message });
    }, [socket]);

    return {
        socket,
        isConnected,
        joinCompetition,
        leaveCompetition,
        submitCode,
        joinWorkspace,
        leaveWorkspace,
        requestFileLock,
        releaseFileLock,
        sendFileChange,
        sendChatMessage,
    };
}
