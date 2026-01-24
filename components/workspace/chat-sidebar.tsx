'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Phone, X, PhoneOff, Mic, MicOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';

export interface ChatMessage {
  messageId: number;
  username: string;
  message: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface ChatSidebarProps {
  messages: ChatMessage[];
  currentUsername: string;
  onSendMessage: (message: string) => Promise<void>;
  // Signaling props
  initiateCall?: (offer: any) => void;
  answerCall?: (answer: any) => void;
  sendIceCandidate?: (candidate: any) => void;
  incomingCall?: { from: string; username?: string; offer: any } | null;
  activeCallData?: { type: string; payload: any; from: string } | null;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  currentUsername,
  onSendMessage,
  initiateCall,
  answerCall,
  sendIceCandidate,
  incomingCall,
  activeCallData
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<any>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle incoming call signaling from parent
  useEffect(() => {
    if (!activeCallData || !peerRef.current) return;

    if (activeCallData.type === 'answer') {
      peerRef.current.signal(activeCallData.payload);
      setCallActive(true);
    } else if (activeCallData.type === 'candidate') {
      peerRef.current.signal(activeCallData.payload);
    }
  }, [activeCallData]);

  const startCall = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(userStream);

      const PeerClass = (await import('simple-peer')).default;
      const peer = new PeerClass({
        initiator: true,
        trickle: true,
        stream: userStream,
      });

      peer.on('signal', (data: any) => {
        initiateCall?.(data);
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });

      peer.on('close', () => endGame());
      peer.on('error', (err: any) => {
        console.error('Peer error:', err);
        endGame();
      });

      peerRef.current = peer;
      setIsCalling(true);
      toast.info('Calling team members...');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(userStream);

      const PeerClass = (await import('simple-peer')).default;
      const peer = new PeerClass({
        initiator: false,
        trickle: true,
        stream: userStream,
      });

      peer.on('signal', (data: any) => {
        answerCall?.(data);
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });

      peer.signal(incomingCall.offer);

      peerRef.current = peer;
      setCallActive(true);
      toast.success(`Connected with ${incomingCall.username}`);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const endGame = () => {
    peerRef.current?.destroy();
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCallActive(false);
    setIsCalling(false);
    peerRef.current = null;
  };

  const handleSend = async (): Promise<void> => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmed);
      setNewMessage('');
    } catch (error) {
      // Error is handled by parent
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-l border-[#2b2b2b]">
      {/* Header with Voice Call Controls */}
      <div className="p-4 border-b border-[#2b2b2b] bg-[#323233] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase text-[#969696]">Workspace Chat</h3>
        </div>
        <div className="flex items-center gap-1">
          {!callActive && !isCalling && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#cccccc] hover:bg-green-600 hover:text-white" onClick={startCall}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {(callActive || isCalling) && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white bg-red-600 hover:bg-red-700" onClick={endGame}>
                <PhoneOff className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#cccccc] hover:bg-[#454545]" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Call Area Overlay */}
      {incomingCall && !callActive && !isCalling && (
        <div className="m-3 p-3 bg-purple-600/20 border border-purple-500 rounded-lg flex items-center justify-between animate-pulse">
          <div className="text-xs">
            <span className="font-bold text-white">{incomingCall.username}</span> is calling...
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white text-[10px]" onClick={acceptCall}>Join</Button>
            <Button size="sm" variant="ghost" className="h-7 text-white text-[10px]" onClick={() => { }}>Ignore</Button>
          </div>
        </div>
      )}

      {/* Audio elements (hidden) */}
      <audio ref={remoteAudioRef} autoPlay />
      <audio ref={localAudioRef} autoPlay muted />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-4 opacity-30">
              <MessageSquare className="h-16 w-16 text-[#cccccc]" />
              <p className="text-xs text-[#cccccc] uppercase font-bold tracking-widest">
                No Radio Traffic
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.messageId}
                className={`flex gap-3 mb-2 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'} max-w-[85%]`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#858585] uppercase">
                      {msg.username}
                    </span>
                    <span className="text-[9px] text-[#555555]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded text-sm ${msg.isCurrentUser
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#37373d] text-[#cccccc]'
                      }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-[#2b2b2b] bg-[#1e1e1e]">
        <div className="flex gap-2 bg-[#3c3c3c] rounded px-2 py-1 items-center border border-transparent focus-within:border-purple-500 transition-colors">
          <Input
            placeholder="Send message to team..."
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewMessage(e.target.value)
            }
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white text-xs h-8 p-0"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-purple-400 hover:text-white hover:bg-transparent"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
