'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

interface ChatMessage {
    userId: string;
    username: string;
    message: string;
    timestamp: number;
}

interface WorkspaceChatProps {
    workspaceId: number;
    messages: ChatMessage[];
    currentUser: string;
    onSendMessage: (message: string) => void;
}

export function WorkspaceChat({
    workspaceId,
    messages,
    currentUser,
    onSendMessage
}: WorkspaceChatProps) {
    const [inputMessage, setInputMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Team Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                    <div className="space-y-3 py-2">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-2 ${msg.username === currentUser ? 'flex-row-reverse' : ''
                                    }`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                        {msg.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`flex flex-col ${msg.username === currentUser ? 'items-end' : 'items-start'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium">{msg.username}</span>
                                        <span>{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div
                                        className={`mt-1 px-3 py-2 rounded-lg max-w-xs ${msg.username === currentUser
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
