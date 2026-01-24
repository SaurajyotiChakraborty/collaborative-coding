'use client';

import { useState } from 'react';
import { CompetitionCreator } from './competition-creator';
import { CompetitionList } from './competition-list';

export const CompeteContainer: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                    Daily Challenges
                </h1>
                <p className="text-muted-foreground">
                    Create your own challenge or join others to climb the leaderboard.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 sticky top-24">
                    <CompetitionCreator onCreated={handleRefresh} />
                </div>
                <div className="lg:col-span-2">
                    <CompetitionList key={refreshKey} />
                </div>
            </div>
        </div>
    );
};
