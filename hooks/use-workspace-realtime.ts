'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSpacetime } from './use-spacetime';
import { createWorkspaceWebSocket, type WorkspaceEvent, type WorkspaceWebSocketClient } from '@/lib/websocket-client';

interface UseWorkspaceRealtimeProps {
  workspaceId: string;
  userId: string;
  username: string;
  enabled?: boolean;
  onEvent?: (event: WorkspaceEvent) => void;
  onCallEvent?: (data: { type: string; from: string; username?: string; offer?: any; payload?: any }) => void;
  onChatMessage?: (chat: { userId: string; username: string; message: string; timestamp: number }) => void;
}

interface UseWorkspaceRealtimeReturn {
  wsClient: WorkspaceWebSocketClient | null;
  isConnected: boolean;
  acquireFileLock: (filePath: string) => Promise<void>;
  releaseFileLock: (filePath: string) => Promise<void>;
  saveFileContent: (filePath: string, content: string) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  initiateCall: (offer: any) => void;
  answerCall: (answer: any) => void;
  sendIceCandidate: (candidate: any) => void;
}

/**
 * Hook for real-time workspace collaboration
 * Integrates SpacetimeDB with WebSocket for live updates
 */
export function useWorkspaceRealtime({
  workspaceId,
  userId,
  username,
  enabled = true,
  onEvent,
  onCallEvent,
  onChatMessage,
}: UseWorkspaceRealtimeProps): UseWorkspaceRealtimeReturn {
  const { db } = useSpacetime();
  const [wsClient, setWsClient] = useState<WorkspaceWebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!enabled) return;

    const client = createWorkspaceWebSocket({
      workspaceId,
      userId,
      username: username || 'Anonymous',
      onConnect: () => {
        console.log('Workspace WebSocket connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('Workspace WebSocket disconnected');
        setIsConnected(false);
      },
      onError: (error) => {
        console.error('Workspace WebSocket error:', error);
      },
      onEvent: (event: WorkspaceEvent) => {
        if (event.type === 'incoming_call' as any) {
          onCallEvent?.({ type: 'offer', from: event.userId, username: (event as any).username, offer: event.data.offer });
        } else if (event.type === 'call_accepted' as any) {
          onCallEvent?.({ type: 'answer', from: event.userId, payload: event.data.answer });
        } else if (event.type === 'ice_candidate' as any) {
          onCallEvent?.({ type: 'candidate', from: event.userId, payload: event.data.candidate });
        } else if (event.type === 'chat_message') {
          onChatMessage?.({
            userId: event.userId,
            username: event.username || 'Anonymous',
            message: event.data.message,
            timestamp: event.timestamp || Date.now(),
          });
        } else {
          onEvent?.(event);
        }
      },
    });

    client.connect();
    setWsClient(client);

    return () => {
      client.disconnect();
    };
  }, [workspaceId, userId, username, enabled, onEvent, onCallEvent]);

  // Handle call methods
  const initiateCall = useCallback((offer: any) => {
    wsClient?.initiateCall(offer);
  }, [wsClient]);

  const answerCall = useCallback((answer: any) => {
    wsClient?.answerCall(answer);
  }, [wsClient]);

  const sendIceCandidate = useCallback((candidate: any) => {
    wsClient?.sendIceCandidate(candidate);
  }, [wsClient]);

  // Acquire file lock
  const acquireFileLock = useCallback(async (filePath: string): Promise<void> => {
    if (!wsClient) {
      throw new Error('WebSocket not connected');
    }

    // TODO: Call SpacetimeDB reducer to acquire lock
    // For now, just notify via WebSocket
    wsClient.notifyFileLocked(filePath);

    console.log(`Acquired lock for file: ${filePath}`);
  }, [db, wsClient]);

  // Release file lock
  const releaseFileLock = useCallback(async (filePath: string): Promise<void> => {
    if (!wsClient) {
      throw new Error('WebSocket not connected');
    }

    // TODO: Call SpacetimeDB reducer to release lock
    // For now, just notify via WebSocket
    wsClient.notifyFileUnlocked(filePath);

    console.log(`Released lock for file: ${filePath}`);
  }, [db, wsClient]);

  // Save file content
  const saveFileContent = useCallback(async (filePath: string, content: string): Promise<void> => {
    if (!wsClient) {
      throw new Error('WebSocket not connected');
    }

    // For now, notify via WebSocket
    wsClient.notifyFileUpdated(filePath, content);

    console.log(`Saved file: ${filePath}`);
  }, [wsClient]);

  // Send chat message
  const sendChatMessage = useCallback(async (message: string): Promise<void> => {
    if (!wsClient) {
      throw new Error('WebSocket not connected');
    }

    // TODO: Call SpacetimeDB reducer to save chat message (Using Prisma Persistence)
    // Send via WebSocket and also persist to DB
    wsClient.sendChatMessage(message);

    // Server Action for persistence
    const { sendWorkspaceMessage } = await import('@/app/actions/workspace');
    await sendWorkspaceMessage(parseInt(workspaceId), userId, username, message);

    console.log(`Sent chat message: ${message}`);
  }, [db, wsClient]);

  return {
    wsClient,
    isConnected,
    acquireFileLock,
    releaseFileLock,
    saveFileContent,
    sendChatMessage,
    initiateCall,
    answerCall,
    sendIceCandidate,
  };
}
