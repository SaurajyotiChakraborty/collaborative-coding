'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSpacetime } from '@/hooks/use-spacetime';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  totalPoints: bigint;
  totalWins: number;
  currentStreak: number;
  competitionsCompleted: number;
}

export const LeaderboardTable: React.FC = () => {
  const { db } = useSpacetime();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!db) return;

    const unsubscribe = db.subscriptionBuilder()
      .onApplied(() => {
        const leaderboard = Array.from(db.tables.leaderboard.values());
        const users = Array.from(db.tables.users.values());

        const combined = leaderboard
          .map((entry) => {
            const user = users.find((u) => u.identity.toHexString() === entry.userId.toHexString());
            return {
              userId: entry.userId.toHexString(),
              username: user?.username || 'Unknown',
              rank: entry.rank,
              totalPoints: entry.totalPoints,
              totalWins: entry.totalWins,
              currentStreak: entry.currentStreak,
              competitionsCompleted: entry.competitionsCompleted,
            };
          })
          .sort((a, b) => Number(b.totalPoints - a.totalPoints));

        setEntries(combined);
      })
      .subscribe(['SELECT * FROM leaderboard', 'SELECT * FROM users']);

    return () => {
      unsubscribe.cancel();
    };
  }, [db]);

  const getRankIcon = (rank: number): JSX.Element | null => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Leaderboard</CardTitle>
        <CardDescription>Top competitive coders</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No leaderboard data yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Wins</TableHead>
                <TableHead className="text-right">Streak</TableHead>
                <TableHead className="text-right">Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={entry.userId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index + 1)}
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell className="text-right">{Number(entry.totalPoints)}</TableCell>
                  <TableCell className="text-right">{entry.totalWins}</TableCell>
                  <TableCell className="text-right">
                    {entry.currentStreak > 0 && (
                      <Badge variant="secondary">{entry.currentStreak}🔥</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{entry.competitionsCompleted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
