
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { db } from '@/services/databaseService';
import { LeaderboardEntry } from '@/types/database';

interface LeaderboardProps {
  limit?: number;
  currentUserId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ limit = 10, currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await db.getLeaderboard();
        setLeaderboard(data.slice(0, limit));
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [limit]);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <Award className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>See how you compare to other students</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No data available yet</div>
        ) : (
          <div className="space-y-1">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.userId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  currentUserId === entry.userId ? "bg-primary/10" : (index % 2 === 0 ? "bg-muted/50" : "")
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <p className="font-medium">{entry.userName}</p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
