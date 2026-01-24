'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Gift, Send, Check, X, Circle } from 'lucide-react';
import type { Friend, FriendRequest, Gift as GiftType } from '@/types/extended-types';

interface FriendsListProps {
  friends: Friend[];
  friendRequests: FriendRequest[];
  receivedGifts: GiftType[];
  onSendRequest: (username: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onSendGift: (friendId: string, giftType: string, message: string) => void;
  onChallengeToMatch: (friendId: string) => void;
}

export function FriendsList({ 
  friends, 
  friendRequests, 
  receivedGifts,
  onSendRequest, 
  onAcceptRequest, 
  onDeclineRequest,
  onSendGift,
  onChallengeToMatch 
}: FriendsListProps): JSX.Element {
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [giftMessage, setGiftMessage] = useState<string>('');

  const handleSendRequest = (): void => {
    if (searchUsername.trim()) {
      onSendRequest(searchUsername);
      setSearchUsername('');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'in-game': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    return <Circle className={`h-3 w-3 ${getStatusColor(status)} fill-current`} />;
  };

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-500" />
            <CardTitle className="gradient-text text-2xl">Friends</CardTitle>
          </div>
          <Badge variant="outline" className="text-lg">
            {friends.length}
          </Badge>
        </div>
        <CardDescription>Connect with friends and send challenges</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">
              Friends
              {friends.length > 0 && <Badge variant="secondary" className="ml-2">{friends.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {friendRequests.length > 0 && <Badge variant="destructive" className="ml-2">{friendRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="gifts">
              Gifts
              {receivedGifts.filter(g => !g.claimed).length > 0 && (
                <Badge variant="destructive" className="ml-2">{receivedGifts.filter(g => !g.claimed).length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
                placeholder="Enter username to add friend..."
              />
              <Button onClick={handleSendRequest} className="bg-gradient-to-r from-purple-600 to-pink-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {friends.map(friend => (
                <Card key={friend.userId} className="card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="relative">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {friend.username[0].toUpperCase()}
                        </AvatarFallback>
                        <div className="absolute -bottom-1 -right-1">
                          {getStatusIcon(friend.status)}
                        </div>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{friend.username}</span>
                          <Badge variant="outline" className="font-mono text-xs">{friend.rating}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{friend.status}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onChallengeToMatch(friend.userId)}
                        size="sm"
                        variant="outline"
                        className="border-purple-500 text-purple-600 dark:text-purple-400"
                      >
                        Challenge
                      </Button>
                      <Button
                        onClick={() => setSelectedFriend(friend)}
                        size="sm"
                        variant="outline"
                        className="border-pink-500 text-pink-600 dark:text-pink-400"
                      >
                        <Gift className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-2">
            {friendRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending friend requests
              </div>
            ) : (
              friendRequests.map(request => (
                <Card key={request.id} className="border-purple-200/50 dark:border-purple-800/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {request.fromUsername[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.fromUsername}</p>
                        <p className="text-xs text-muted-foreground">
                          Sent {new Date(request.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onAcceptRequest(request.id)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDeclineRequest(request.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 dark:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="gifts" className="space-y-2">
            {receivedGifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No gifts received yet
              </div>
            ) : (
              receivedGifts.map(gift => (
                <Card 
                  key={gift.id} 
                  className={`${gift.claimed ? 'opacity-50' : 'border-pink-200 dark:border-pink-800'}`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">🎁 {gift.type}</p>
                        <p className="text-xs text-muted-foreground">From {gift.fromUsername}</p>
                      </div>
                      {!gift.claimed && (
                        <Button size="sm" className="bg-gradient-to-r from-pink-600 to-orange-600">
                          Claim
                        </Button>
                      )}
                      {gift.claimed && (
                        <Badge variant="secondary" className="bg-green-500 text-white">Claimed</Badge>
                      )}
                    </div>
                    {gift.message && (
                      <p className="text-xs italic text-muted-foreground">&quot;{gift.message}&quot;</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
