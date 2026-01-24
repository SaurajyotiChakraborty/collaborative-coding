'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, Swords, MessageSquare, Plus, Crown, Shield, User } from 'lucide-react';
import type { Team, ClanWar } from '@/types/extended-types';

interface TeamManagerProps {
  userTeam: Team | null;
  availableTeams: Team[];
  activeWars: ClanWar[];
  onCreateTeam: (name: string, tag: string, description: string) => void;
  onJoinTeam: (teamId: string) => void;
  onLeaveTeam: () => void;
  onStartWar: (opponentTeamId: string) => void;
  onSendMessage: (message: string) => void;
}

export function TeamManager({ 
  userTeam, 
  availableTeams, 
  activeWars,
  onCreateTeam, 
  onJoinTeam, 
  onLeaveTeam,
  onStartWar,
  onSendMessage 
}: TeamManagerProps): JSX.Element {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>('');
  const [teamTag, setTeamTag] = useState<string>('');
  const [teamDescription, setTeamDescription] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');

  const handleCreateTeam = (): void => {
    if (teamName && teamTag) {
      onCreateTeam(teamName, teamTag, teamDescription);
      setIsCreating(false);
      setTeamName('');
      setTeamTag('');
      setTeamDescription('');
    }
  };

  const handleSendMessage = (): void => {
    if (chatMessage.trim()) {
      onSendMessage(chatMessage);
      setChatMessage('');
    }
  };

  const getRoleIcon = (role: string): JSX.Element => {
    switch (role) {
      case 'leader': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'officer': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!userTeam) {
    return (
      <Card className="glass-strong border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="gradient-text text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            Teams & Clans
          </CardTitle>
          <CardDescription>Join or create a team to compete together</CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Create Your Team</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Team Tag (2-5 chars)</label>
                  <Input
                    value={teamTag}
                    onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                    placeholder="TAG"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Tell others about your team..."
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateTeam} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                  Create Team
                </Button>
                <Button onClick={() => setIsCreating(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={() => setIsCreating(true)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create New Team
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or join existing</span>
                </div>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {availableTeams.map(team => (
                  <Card key={team.id} className="card-hover">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg flex items-center gap-2">
                            {team.name}
                            <Badge variant="outline">[{team.tag}]</Badge>
                          </h4>
                          <p className="text-xs text-muted-foreground">{team.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-purple-500" />
                            {team.members.length}/{team.maxMembers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-orange-500" />
                            {team.rating}
                          </span>
                        </div>
                        <Button onClick={() => onJoinTeam(team.id)} size="sm" variant="outline">
                          Join Team
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="gradient-text text-2xl flex items-center gap-2">
              {userTeam.emblem || '🛡️'} {userTeam.name}
              <Badge variant="outline" className="font-mono">[{userTeam.tag}]</Badge>
            </CardTitle>
            <CardDescription>{userTeam.description}</CardDescription>
          </div>
          <Button onClick={onLeaveTeam} variant="outline" size="sm">
            Leave Team
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="wars">Clan Wars</TabsTrigger>
            <TabsTrigger value="chat">Team Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">{userTeam.rating}</p>
                <p className="text-xs text-muted-foreground">Team Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userTeam.wins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{userTeam.losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
            </div>

            <div className="space-y-2">
              {userTeam.members.map(member => (
                <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {member.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{member.username}</span>
                        {getRoleIcon(member.role)}
                        <Badge variant="outline" className="capitalize text-xs">{member.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Contribution: {member.contribution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wars" className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600" size="lg">
              <Swords className="h-5 w-5 mr-2" />
              Challenge Another Team
            </Button>

            {activeWars.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold">Active Wars</h3>
                {activeWars.map(war => (
                  <Card key={war.id} className="border-red-500/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-bold">{war.team1} vs {war.team2}</p>
                          <p className="text-muted-foreground">Score: {war.team1Score} - {war.team2Score}</p>
                        </div>
                        <Badge variant={war.status === 'active' ? 'default' : 'secondary'}>
                          {war.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-2 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              {userTeam.chat.map(msg => (
                <div key={msg.id} className="p-2 rounded bg-white dark:bg-gray-800">
                  <p className="text-xs text-muted-foreground">{msg.senderUsername}</p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
              />
              <Button onClick={handleSendMessage}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
