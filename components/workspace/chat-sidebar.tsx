'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Phone, X, PhoneOff, Mic, MicOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  members: any[]; // Add members prop
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  currentUsername,
  onSendMessage,
  initiateCall,
  answerCall,
  sendIceCandidate,
  incomingCall,
  activeCallData,
  members
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

    try {
      if (activeCallData.type === 'answer') {
        peerRef.current.signal(activeCallData.payload);
        setCallActive(true);
      } else if (activeCallData.type === 'candidate') {
        peerRef.current.signal(activeCallData.payload);
      }
    } catch (e) {
      console.error("Signaling error:", e);
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
        // stream: userStream, <--- Removed to avoid renegotiate race condition
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      peer.addStream(userStream); // <--- Added explicitly

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
        // Don't kill immediately on minor errors, but log
        if (err.code === 'ERR_DATA_CHANNEL') return;
        toast.error(`Call error: ${err.message}`);
        endGame();
      });

      peerRef.current = peer;
      setIsCalling(true);
      toast.info('Calling team members...');
    } catch (error: any) {
      console.error('Call error:', error);
      const msg = error.name === 'NotAllowedError' ? 'Microphone permission denied' : `Call failed: ${error.message}`;
      toast.error(msg);
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
        // stream: userStream, <--- Removed
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      peer.addStream(userStream); // <--- Added explicitly

      peer.on('signal', (data: any) => {
        answerCall?.(data);
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });

      peer.on('error', (err: any) => {
        console.error('Peer error on answer:', err);
        if (err.code === 'ERR_DATA_CHANNEL') return;
        toast.error(`Connection error: ${err.message}`);
        endGame();
      });

      // Delay signal to allow peer to fully initialize after addStream
      setTimeout(() => {
        try {
          // Check both offer and payload in case of upstream naming variations
          const signalData = incomingCall.offer || (incomingCall as any).payload;

          if (!signalData) {
            console.error('Missing signal data in incomingCall:', incomingCall);
            toast.error('Invalid call data received');
            return;
          }

          console.log('Answering call with signal data:', signalData);
          peer.signal(signalData);
        } catch (err: any) {
          console.error('Signal error during answer:', err);
          toast.error('Failed to establish connection');
          endGame();
        }
      }, 100);

      peerRef.current = peer;
      setCallActive(true);
      toast.success(`Connecting with ${incomingCall.username}...`);
    } catch (error: any) {
      console.error('Answer error:', error);
      const msg = error.name === 'NotAllowedError' ? 'Microphone permission denied' : `Connection failed: ${error.message}`;
      toast.error(msg);
    }
  };

  const endGame = () => {
    try {
      peerRef.current?.destroy();
    } catch (e) { }
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
      {/* Header */}
      <div className="p-3 border-b border-[#2b2b2b] bg-[#323233] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase text-[#969696]">Workspace</h3>
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

      <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
        <div className="px-2 pt-2">
          <TabsList className="w-full bg-[#1e1e1e]">
            <TabsTrigger value="chat" className="flex-1 text-xs">Chat</TabsTrigger>
            <TabsTrigger value="members" className="flex-1 text-xs">Team ({members.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex">
          {/* Call Area Overlay */}
          {incomingCall && !callActive && !isCalling && (
            <div className="m-3 p-3 bg-purple-600/20 border border-purple-500 rounded-lg flex items-center justify-between animate-pulse">
              <div className="text-xs flex items-center gap-1">
                <span className="font-bold text-white">{incomingCall.username}</span>
                <span>is calling...</span>
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
        </TabsContent>

        <TabsContent value="members" className="flex-1 min-h-0 m-0 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.userId} className="flex items-center gap-3 p-2 rounded bg-[#3c3c3c]/50">
                  <Avatar className="h-8 w-8">
                    <span className="text-xs font-bold">{(member.username || '??').slice(0, 2).toUpperCase()}</span>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{member.username || 'Unknown User'}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{member.role}</p>
                  </div>
                  {member.isOnline && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
