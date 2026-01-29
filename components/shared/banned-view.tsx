'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Home, Mail, Loader2, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { submitBanAppeal, getUserAppealStatus } from '@/app/actions/appeal';
import { toast } from 'sonner';

export function BannedView() {
    const { data: session } = useSession();
    const [isAppealing, setIsAppealing] = useState(false);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [existingAppeal, setExistingAppeal] = useState<any>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (session?.user?.id) {
                const res = await getUserAppealStatus(session.user.id);
                if (res.success) {
                    setExistingAppeal(res.appeal);
                }
            }
            setIsCheckingStatus(false);
        };
        checkStatus();
    }, [session?.user?.id]);

    const handleAppeal = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for your appeal');
            return;
        }

        setIsLoading(true);
        try {
            const userId = (session?.user as any)?.id;
            if (!userId) {
                toast.error('Session error. Please refresh.');
                return;
            }

            const res = await submitBanAppeal(userId, reason);
            if (res.success) {
                toast.success('Appeal submitted successfully');
                setExistingAppeal(res.appeal);
                setIsAppealing(false);
            } else {
                toast.error(res.error || 'Failed to submit appeal');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingStatus) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-md w-full border-red-200 dark:border-red-900 shadow-2xl shadow-red-500/10 transition-all duration-500 overflow-hidden">
                <CardHeader className="text-center space-y-4">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
                        {existingAppeal?.status === 'Pending' ? (
                            <Mail className="h-10 w-10 text-orange-500 animate-pulse" />
                        ) : (
                            <AlertTriangle className="h-10 w-10 text-red-600" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-extrabold text-red-600">
                            {existingAppeal?.status === 'Pending' ? 'Appeal Pending' : 'Access Restrained'}
                        </CardTitle>
                        <CardDescription className="text-lg">
                            {existingAppeal?.status === 'Pending'
                                ? 'Our moderation team is reviewing your request.'
                                : 'Your account has been flagged for violation of platform terms.'}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isAppealing && !existingAppeal && (
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in slide-in-from-top-4">
                            <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                                Participation in challenges, competitions, and collaborative workspaces is currently restricted for your account.
                            </p>
                        </div>
                    )}

                    {existingAppeal && !isAppealing && (
                        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 space-y-3 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400 font-bold">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Appeal Status: {existingAppeal.status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap italic">
                                "{existingAppeal.reason}"
                            </p>
                            {existingAppeal.adminNotes && (
                                <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
                                    <p className="text-[10px] uppercase font-bold text-orange-600">Admin Notes:</p>
                                    <p className="text-sm text-orange-900 dark:text-orange-200">{existingAppeal.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {isAppealing ? (
                        <div className="space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Why should we restore your access?</label>
                                <Textarea
                                    placeholder="Explain the situation clearly. Honest appeals are prioritized."
                                    className="min-h-[120px] resize-none border-red-200 focus-visible:ring-red-500"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={() => setIsAppealing(false)} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                                    onClick={handleAppeal}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Submit
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" asChild className="gap-2">
                                <Link href="/">
                                    <Home className="h-4 w-4" />
                                    Home
                                </Link>
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white gap-2 transition-transform active:scale-95"
                                onClick={() => setIsAppealing(true)}
                                disabled={existingAppeal?.status === 'Pending'}
                            >
                                <Mail className="h-4 w-4" />
                                {existingAppeal?.status === 'Rejected' ? 'Re-Appeal' : 'Appeal Ban'}
                            </Button>
                        </div>
                    )}

                    <p className="text-[10px] text-center text-muted-foreground">
                        User ID: {(session?.user as any)?.id}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
