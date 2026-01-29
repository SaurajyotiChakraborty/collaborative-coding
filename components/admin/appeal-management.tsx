'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Gavel,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquare,
    User as UserIcon,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { getBanAppeals, resolveBanAppeal } from '@/app/actions/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AppealManagement() {
    const [appeals, setAppeals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
    const [adminNotes, setAdminNotes] = useState<{ [key: number]: string }>({});

    const fetchAppeals = async () => {
        setIsLoading(true);
        const res = await getBanAppeals();
        if (res.success) {
            setAppeals(res.appeals);
        } else {
            toast.error('Failed to fetch appeals');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAppeals();
    }, []);

    const handleResolve = async (appealId: number, status: 'Approved' | 'Rejected') => {
        setIsActionLoading(appealId);
        try {
            const res = await resolveBanAppeal(appealId, status, adminNotes[appealId]);
            if (res.success) {
                toast.success(`Appeal ${status.toLowerCase()} successfully`);
                fetchAppeals();
            } else {
                toast.error('Failed to resolve appeal');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                <p className="text-muted-foreground animate-pulse">Loading appeals...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Ban Appeals</h2>
                    <p className="text-sm text-muted-foreground">Review and manage user appeals for account restoration.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAppeals} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {appeals.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-medium">No active appeals</p>
                            <p className="text-sm text-muted-foreground">All is quiet. No users have submitted appeals yet.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {appeals.map((appeal) => (
                        <Card key={appeal.id} className={cn(
                            "overflow-hidden transition-all duration-300",
                            appeal.status === 'Pending' ? "border-orange-200 dark:border-orange-900 shadow-lg shadow-orange-500/5" : "bg-muted/30"
                        )}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/50 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">{appeal.user.username}</CardTitle>
                                        <CardDescription className="text-xs">{appeal.user.email}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant={
                                    appeal.status === 'Pending' ? 'outline' :
                                        appeal.status === 'Approved' ? 'default' : 'destructive'
                                } className={cn(
                                    appeal.status === 'Pending' && "border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/20"
                                )}>
                                    {appeal.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                        <MessageSquare className="h-4 w-4" />
                                        Appeal Reason:
                                    </div>
                                    <div className="p-4 bg-background rounded-lg border border-muted italic text-sm text-foreground whitespace-pre-wrap">
                                        "{appeal.reason}"
                                    </div>
                                </div>

                                {appeal.status === 'Pending' ? (
                                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                                <Gavel className="h-4 w-4" />
                                                Admin Notes (Optional):
                                            </div>
                                            <Textarea
                                                placeholder="Explain your decision..."
                                                className="min-h-[80px] text-sm"
                                                value={adminNotes[appeal.id] || ''}
                                                onChange={(e) => setAdminNotes({ ...adminNotes, [appeal.id]: e.target.value })}
                                                disabled={isActionLoading === appeal.id}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                                                onClick={() => handleResolve(appeal.id, 'Approved')}
                                                disabled={isActionLoading !== null}
                                            >
                                                {isActionLoading === appeal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                Approve & Unban
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 gap-2"
                                                onClick={() => handleResolve(appeal.id, 'Rejected')}
                                                disabled={isActionLoading !== null}
                                            >
                                                {isActionLoading === appeal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                                Reject Appeal
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-muted">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Decision Summary:</p>
                                        <p className="text-sm">
                                            Resolved by admin on {new Date(appeal.resolvedAt).toLocaleDateString()}.
                                        </p>
                                        {appeal.adminNotes && (
                                            <p className="text-sm mt-2 text-muted-foreground italic bg-muted/50 p-2 rounded">
                                                Notes: {appeal.adminNotes}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
