'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DiscussionForumProps {
    posts: any[];
    onCreatePost: (title: string, content: string, tags: string[]) => void;
    onReply: (postId: string, content: string) => void;
    onUpvote: (postId: string, replyId?: string) => void;
    onDownvote: (postId: string, replyId?: string) => void;
    onMarkSolved: (postId: string, replyId: string) => void;
}

export const DiscussionForum: React.FC<DiscussionForumProps> = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Discussion Forum</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Forum features are currently under maintenance.</p>
            </CardContent>
        </Card>
    );
};
