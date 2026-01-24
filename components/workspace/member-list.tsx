'use client';

import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Circle, Crown, Shield, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface WorkspaceMember {
  membershipId: number;
  userId: string;
  username: string;
  role: 'Leader' | 'Maintainer' | 'Contributor' | 'Viewer';
  isOnline: boolean;
  gitUsername: string;
}

interface MemberListProps {
  members: WorkspaceMember[];
  currentUserId: string;
}

export const MemberList: React.FC<MemberListProps> = ({ members, currentUserId }) => {
  const getRoleIcon = (role: string): React.ReactElement => {
    const iconMap: Record<string, React.ReactElement> = {
      Leader: <Crown className="h-3 w-3" />,
      Maintainer: <Shield className="h-3 w-3" />,
      Contributor: <Edit className="h-3 w-3" />,
      Viewer: <Users className="h-3 w-3" />,
    };
    return iconMap[role] || <Users className="h-3 w-3" />;
  };

  const getRoleColor = (role: string): string => {
    const colorMap: Record<string, string> = {
      Leader: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      Maintainer: 'bg-gradient-to-r from-purple-500 to-pink-500',
      Contributor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      Viewer: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return colorMap[role] || 'bg-gray-500';
  };

  const onlineMembers = members.filter((m) => m.isOnline);
  const offlineMembers = members.filter((m) => !m.isOnline);

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Members
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {onlineMembers.length} of {members.length} online
        </p>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Online Members */}
          {onlineMembers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Online — {onlineMembers.length}
              </h4>
              <div className="space-y-2">
                {onlineMembers.map((member) => {
                  const isCurrentUser = member.userId === currentUserId;
                  const displayName = member.username || (member as any).user?.username || 'Unknown';
                  return (
                    <div
                      key={member.membershipId || member.userId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <div
                            className={`w-full h-full flex items-center justify-center text-white font-semibold ${getRoleColor(
                              member.role
                            )}`}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {displayName}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-1">(You)</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                          <Circle className="h-2 w-2 text-green-500 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Offline Members */}
          {offlineMembers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Offline — {offlineMembers.length}
              </h4>
              <div className="space-y-2">
                {offlineMembers.map((member) => {
                  const displayName = member.username || (member as any).user?.username || 'Unknown';
                  return (
                    <div
                      key={member.membershipId || member.userId}
                      className="flex items-center gap-3 p-2 rounded-lg opacity-60"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <div
                            className={`w-full h-full flex items-center justify-center text-white font-semibold ${getRoleColor(
                              member.role
                            )}`}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-gray-400 border-2 border-white dark:border-gray-900 rounded-full" />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <Badge variant="outline" className="text-xs mt-0.5 flex items-center gap-1 w-fit">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
