'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, Copy, Check, TrendingUp } from 'lucide-react';
import type { ReferralData } from '@/types/extended-types';
import { toast } from 'sonner';

interface ReferralSystemProps {
  referralData: ReferralData;
}

export function ReferralSystem({ referralData }: ReferralSystemProps): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);

  const referralLink = `https://optimize-coder.app/ref/${referralData.referralCode}`;

  const handleCopyLink = (): void => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const milestones = [
    { count: 1, reward: '500 XP', reached: referralData.referredUsers.length >= 1 },
    { count: 5, reward: 'Recruiter Badge', reached: referralData.referredUsers.length >= 5 },
    { count: 10, reward: '7 Days Premium', reached: referralData.referredUsers.length >= 10 },
    { count: 25, reward: 'Special Title', reached: referralData.referredUsers.length >= 25 },
    { count: 50, reward: 'Legendary Frame', reached: referralData.referredUsers.length >= 50 },
  ];

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-purple-500" />
          <CardTitle className="gradient-text text-2xl">Referral Program</CardTitle>
        </div>
        <CardDescription>Invite friends and earn amazing rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white border-0">
          <CardContent className="p-6 text-center space-y-4">
            <Gift className="h-12 w-12 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Your Referral Code</h3>
              <p className="text-4xl font-mono font-bold tracking-wider mb-4">
                {referralData.referralCode}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <Button
                onClick={handleCopyLink}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-purple-200/50 dark:border-purple-800/50">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold gradient-text">{referralData.referredUsers.length}</p>
              <p className="text-xs text-muted-foreground">Friends Referred</p>
            </CardContent>
          </Card>
          <Card className="border-green-200/50 dark:border-green-800/50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {referralData.totalEarned}
              </p>
              <p className="text-xs text-muted-foreground">Total XP Earned</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200/50 dark:border-orange-800/50">
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {referralData.rewards.length}
              </p>
              <p className="text-xs text-muted-foreground">Rewards Unlocked</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-200/50 dark:border-purple-800/50">
          <CardHeader>
            <CardTitle className="text-lg">Referral Milestones</CardTitle>
            <CardDescription>Unlock rewards as you invite more friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {milestones.map((milestone, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  milestone.reached
                    ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-900/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {milestone.reached ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                  <div>
                    <p className="font-semibold">Refer {milestone.count} Friend{milestone.count > 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted-foreground">Reward: {milestone.reward}</p>
                  </div>
                </div>
                {milestone.reached ? (
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    {milestone.count - referralData.referredUsers.length} more
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-800/50">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="font-mono">1</Badge>
                <div>
                  <p className="font-semibold">Share Your Link</p>
                  <p className="text-sm text-muted-foreground">Send your referral link to friends</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="font-mono">2</Badge>
                <div>
                  <p className="font-semibold">They Sign Up</p>
                  <p className="text-sm text-muted-foreground">Your friend creates an account using your link</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="font-mono">3</Badge>
                <div>
                  <p className="font-semibold">Both Get Rewards</p>
                  <p className="text-sm text-muted-foreground">You get 1000 XP, they get 500 XP bonus</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
