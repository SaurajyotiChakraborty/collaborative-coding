'use client';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface YjsProviderConfig {
  workspaceId: string;
  userId: string;
  username: string;
}

/**
 * Creates a Yjs document and WebSocket provider for real-time collaboration
 */
export class CollaborativeTextProvider {
  public doc: Y.Doc;
  public provider: WebsocketProvider | null = null;
  private config: YjsProviderConfig;

  constructor(config: YjsProviderConfig) {
    this.config = config;
    this.doc = new Y.Doc();
  }

  /**
   * Connect to the WebSocket server for real-time synchronization
   */
  connect(): void {
    if (typeof window === 'undefined') return;

    // Use your WebSocket server URL (default to localhost for development)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234';
    
    this.provider = new WebsocketProvider(
      wsUrl,
      `workspace-${this.config.workspaceId}`,
      this.doc,
      {
        connect: true,
        // Awareness allows showing cursor positions and selections
        params: {
          userId: this.config.userId,
          username: this.config.username,
        },
      }
    );

    // Set awareness state (user info)
    this.provider.awareness.setLocalStateField('user', {
      id: this.config.userId,
      name: this.config.username,
      color: this.getUserColor(this.config.userId),
    });

    // Listen for connection events
    this.provider.on('status', ({ status }: { status: string }) => {
      console.log(`Yjs WebSocket status: ${status}`);
    });

    this.provider.on('sync', (isSynced: boolean) => {
      console.log(`Yjs sync status: ${isSynced ? 'synced' : 'syncing'}`);
    });
  }

  /**
   * Get a shared text instance for a specific file
   */
  getSharedText(filePath: string): Y.Text {
    return this.doc.getText(filePath);
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }
  }

  /**
   * Get awareness state (other users' cursors and selections)
   */
  getAwarenessStates(): Map<number, Record<string, unknown>> {
    if (!this.provider) return new Map();
    return this.provider.awareness.getStates();
  }

  /**
   * Subscribe to awareness changes
   */
  onAwarenessChange(callback: () => void): () => void {
    if (!this.provider) return () => {};

    this.provider.awareness.on('change', callback);
    return () => {
      if (this.provider) {
        this.provider.awareness.off('change', callback);
      }
    };
  }

  /**
   * Generate a consistent color for a user based on their ID
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    ];
    
    // Simple hash function to pick a color
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}

/**
 * Create a Yjs provider instance
 */
export function createYjsProvider(config: YjsProviderConfig): CollaborativeTextProvider {
  return new CollaborativeTextProvider(config);
}
