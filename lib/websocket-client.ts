'use client';

import { io, Socket } from 'socket.io-client';

/**
 * WebSocket Client for Real-time Workspace Updates using Socket.IO
 * Handles file locks, chat messages, and presence updates
 */

export type WorkspaceEventType =
  | 'file_locked'
  | 'file_unlocked'
  | 'file_updated'
  | 'member_joined'
  | 'member_left'
  | 'member_online'
  | 'member_offline'
  | 'chat_message'
  | 'workspace_synced';

export interface WorkspaceEvent {
  type: WorkspaceEventType;
  workspaceId: string;
  userId: string;
  username?: string;
  data: any;
  timestamp: number;
}

export interface WebSocketClientConfig {
  workspaceId: string;
  userId: string;
  username: string;
  onEvent?: (event: WorkspaceEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class WorkspaceWebSocketClient {
  private socket: Socket | null = null;
  private config: WebSocketClientConfig;

  constructor(config: WebSocketClientConfig) {
    this.config = config;
  }

  /**
   * Connect to Socket.IO server
   */
  connect(): void {
    if (typeof window === 'undefined') return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

    try {
      this.socket = io(wsUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected');

        // Authenticate and Join Workspace
        this.socket?.emit('authenticate', {
          userId: this.config.userId,
          username: this.config.username
        });

        this.socket?.emit('join-workspace', {
          workspaceId: this.config.workspaceId
        });

        this.config.onConnect?.();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.config.onDisconnect?.();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.config.onError?.(error);
      });

      // Map incoming Socket.IO events to old WorkspaceEvent structure for compatibility
      this.socket.on('file-locked', (data) => {
        this.config.onEvent?.({
          type: 'file_locked',
          workspaceId: this.config.workspaceId,
          userId: data.lockedBy,
          username: data.username,
          data: { filePath: data.filePath },
          timestamp: Date.now()
        });
      });

      this.socket.on('file-unlocked', (data) => {
        this.config.onEvent?.({
          type: 'file_unlocked',
          workspaceId: this.config.workspaceId,
          userId: '', // Server doesn't send who unlocked, usually clear
          data: { filePath: data.filePath },
          timestamp: Date.now()
        });
      });

      this.socket.on('file-changed', (data) => {
        this.config.onEvent?.({
          type: 'file_updated',
          workspaceId: this.config.workspaceId,
          userId: data.changedBy,
          data: { filePath: data.filePath },
          timestamp: Date.now()
        });
      });

      this.socket.on('chat-message', (data) => {
        this.config.onEvent?.({
          type: 'chat_message',
          workspaceId: this.config.workspaceId,
          userId: data.userId,
          username: data.username,
          data: { message: data.message },
          timestamp: data.timestamp
        });
      });

      this.socket.on('member-joined', (data) => {
        this.config.onEvent?.({
          type: 'member_joined',
          workspaceId: this.config.workspaceId,
          userId: data.userId,
          username: data.username,
          data: { members: data.members },
          timestamp: Date.now()
        });
      });

      this.socket.on('member-left', (data) => {
        this.config.onEvent?.({
          type: 'member_left',
          workspaceId: this.config.workspaceId,
          userId: data.userId,
          data: { members: data.members },
          timestamp: Date.now()
        });
      });

      // WebRTC Call Listeners
      this.socket.on('incoming-call', (data) => {
        this.config.onEvent?.({
          type: 'incoming_call' as any,
          workspaceId: this.config.workspaceId,
          userId: data.from,
          username: data.username,
          data: { offer: data.offer },
          timestamp: Date.now()
        });
      });

      this.socket.on('call-accepted', (data) => {
        this.config.onEvent?.({
          type: 'call_accepted' as any,
          workspaceId: this.config.workspaceId,
          userId: data.from,
          data: { answer: data.answer },
          timestamp: Date.now()
        });
      });

      this.socket.on('ice-candidate', (data) => {
        this.config.onEvent?.({
          type: 'ice_candidate' as any,
          workspaceId: this.config.workspaceId,
          userId: data.from,
          data: { candidate: data.candidate },
          timestamp: Date.now()
        });
      });

    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
      this.config.onError?.(error as Error);
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Generic send (legacy compatibility)
   */
  send(event: WorkspaceEvent): void {
    // This is problematic with Socket.IO pattern but kept for minimal breaking changes
    // Better to use specific methods below
    console.warn('Direct send() is deprecated with Socket.IO, use specific notify/send methods');
  }

  /**
   * Notify about file lock acquisition
   */
  notifyFileLocked(filePath: string): void {
    this.socket?.emit('request-file-lock', {
      workspaceId: this.config.workspaceId,
      filePath,
    });
  }

  /**
   * Notify about file lock release
   */
  notifyFileUnlocked(filePath: string): void {
    this.socket?.emit('release-file-lock', {
      workspaceId: this.config.workspaceId,
      filePath,
    });
  }

  /**
   * Notify about file content update
   */
  notifyFileUpdated(filePath: string, content: string): void {
    this.socket?.emit('file-change', {
      workspaceId: this.config.workspaceId,
      filePath,
      content
    });
  }

  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    this.socket?.emit('workspace-chat', {
      workspaceId: this.config.workspaceId,
      message,
    });
  }

  // WebRTC Signaling
  initiateCall(offer: any): void {
    this.socket?.emit('call-user', {
      workspaceId: this.config.workspaceId,
      offer,
    });
  }

  answerCall(answer: any): void {
    this.socket?.emit('answer-call', {
      workspaceId: this.config.workspaceId,
      answer,
    });
  }

  sendIceCandidate(candidate: any): void {
    this.socket?.emit('ice-candidate', {
      workspaceId: this.config.workspaceId,
      candidate,
    });
  }
}

/**
 * Create a WebSocket client instance
 */
export function createWorkspaceWebSocket(config: WebSocketClientConfig): WorkspaceWebSocketClient {
  return new WorkspaceWebSocketClient(config);
}
