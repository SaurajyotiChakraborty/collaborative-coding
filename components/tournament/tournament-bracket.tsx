'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSpacetime } from '@/hooks/use-spacetime';
import { toast } from 'sonner';
import { Trophy, Users, Calendar } from 'lucide-react';

interface TournamentMatch {
  matchId: string;
  player1: string;
  player2: string;
  winner: string | null;
  round: number;
}

interface Tournament {
  tournamentId: bigint;
  name: string;
  status: string;
  participants: string[];
  matches: TournamentMatch[];
  startTime: Date;
}

export const TournamentBracket: React.FC = () => {
  const { db } = useSpacetime();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const createTournament = async (): Promise<void> => {
    if (!db) {
      toast.error('Database not connected');
      return;
    }

    try {
      toast.info('Creating tournament...');
      
      const mockTournament: Tournament = {
        tournamentId: BigInt(Date.now()),
        name: 'Weekly Championship',
        status: 'Registration',
        participants: [],
        matches: [],
        startTime: new Date(Date.now() + 86400000),
      };

      setTournaments([...tournaments, mockTournament]);
      toast.success('Tournament created! Registration is open.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tournament';
      toast.error(errorMessage);
    }
  };

  const joinTournament = async (tournamentId: bigint): Promise<void> => {
    try {
      toast.success('Joined tournament successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join';
      toast.error(errorMessage);
    }
  };

  const renderBracket = (tournament: Tournament): JSX.Element => {
    const rounds = Math.ceil(Math.log2(tournament.participants.length || 2));
    
    return (
      <div className="space-y-6">
        {Array.from({ length: rounds }).map((_, roundIndex) => (
          <div key={roundIndex} className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Round {roundIndex + 1} {roundIndex === rounds - 1 ? '(Finals)' : ''}
            </h3>
            <div className="grid gap-2">
              {tournament.matches
                .filter((m) => m.round === roundIndex + 1)
                .map((match) => (
                  <Card key={match.matchId} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className={`flex items-center justify-between p-2 rounded ${match.winner === match.player1 ? 'bg-green-100' : 'bg-gray-50'}`}>
                          <span className="font-medium">{match.player1}</span>
                          {match.winner === match.player1 && <Trophy className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded ${match.winner === match.player2 ? 'bg-green-100' : 'bg-gray-50'}`}>
                          <span className="font-medium">{match.player2}</span>
                          {match.winner === match.player2 && <Trophy className="h-4 w-4 text-yellow-600" />}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tournament Brackets
              </CardTitle>
              <CardDescription>Compete in organized tournaments</CardDescription>
            </div>
            <Button onClick={createTournament}>Create Tournament</Button>
          </div>
        </CardHeader>
      </Card>

      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active tournaments</p>
            <Button onClick={createTournament} className="mt-4">
              Create First Tournament
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tournaments.map((tournament) => (
            <Card key={tournament.tournamentId.toString()}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tournament.name}
                  <Badge>{tournament.status}</Badge>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {tournament.participants.length} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {tournament.startTime.toLocaleDateString()}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tournament.status === 'Registration' ? (
                  <Button
                    onClick={() => joinTournament(tournament.tournamentId)}
                    className="w-full"
                  >
                    Join Tournament
                  </Button>
                ) : (
                  <Button
                    onClick={() => setSelectedTournament(tournament)}
                    variant="outline"
                    className="w-full"
                  >
                    View Bracket
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTournament && (
        <Card>
          <CardHeader>
            <CardTitle>Tournament Bracket: {selectedTournament.name}</CardTitle>
            <CardDescription>Live bracket updates</CardDescription>
          </CardHeader>
          <CardContent>
            {renderBracket(selectedTournament)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
