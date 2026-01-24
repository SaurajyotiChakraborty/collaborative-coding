'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/app/actions/notification';

interface Notification {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    competitionId?: number;
}

export function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const loadNotifications = async () => {
        const result = await getNotifications(userId);
        if (result.success && result.notifications) {
            setNotifications(result.notifications as any);
            setUnreadCount(result.notifications.filter((n: any) => !n.isRead).length);
        }
    };

    const handleMarkRead = async (notificationId: number) => {
        await markNotificationRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead(userId);
        loadNotifications();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ChallengeRequest':
                return '🎯';
            case 'CompetitionStart':
                return '🚀';
            case 'Result':
                return '🏆';
            default:
                return '📢';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!notification.isRead ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                                        }`}
                                    onClick={() => handleMarkRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="h-2 w-2 bg-purple-600 rounded-full mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
