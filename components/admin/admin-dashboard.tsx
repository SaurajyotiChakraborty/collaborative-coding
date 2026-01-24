'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, FileText, Flag, CheckCircle, XCircle, Ban, Award } from 'lucide-react';
import type { AdminAction, ModeratorQueue } from '@/types/extended-types';

interface AdminDashboardProps {
  moderatorQueue: ModeratorQueue;
  recentActions: AdminAction[];
  onBanUser: (userId: string, reason: string) => void;
  onWarnUser: (userId: string, reason: string) => void;
  onApproveQuestion: (questionId: bigint) => void;
  onRejectQuestion: (questionId: bigint, reason: string) => void;
  onResolveReport: (contentId: string, action: 'resolved' | 'dismissed') => void;
}

export function AdminDashboard({ 
  moderatorQueue,
  recentActions,
  onBanUser,
  onWarnUser,
  onApproveQuestion,
  onRejectQuestion,
  onResolveReport
}: AdminDashboardProps): JSX.Element {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [actionReason, setActionReason] = useState<string>('');

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-500" />
          <CardTitle className="gradient-text text-2xl">Admin Dashboard</CardTitle>
        </div>
        <CardDescription>Manage users, content, and moderation</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">
              Questions
              {moderatorQueue.userSubmittedQuestions.filter(q => q.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {moderatorQueue.userSubmittedQuestions.filter(q => q.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports">
              Reports
              {moderatorQueue.reportedContent.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {moderatorQueue.reportedContent.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-purple-200/50 dark:border-purple-800/50">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold gradient-text">
                    {moderatorQueue.userSubmittedQuestions.filter(q => q.status === 'pending').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Questions</p>
                </CardContent>
              </Card>
              <Card className="border-red-200/50 dark:border-red-800/50">
                <CardContent className="p-4 text-center">
                  <Flag className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {moderatorQueue.reportedContent.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Reports</p>
                </CardContent>
              </Card>
              <Card className="border-green-200/50 dark:border-green-800/50">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {recentActions.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Actions Today</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-purple-200/50 dark:border-purple-800/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    placeholder="Username or User ID"
                    className="flex-1"
                  />
                </div>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Reason for action..."
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (selectedUser && actionReason) {
                        onWarnUser(selectedUser, actionReason);
                        setSelectedUser('');
                        setActionReason('');
                      }
                    }}
                    variant="outline"
                    className="flex-1 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Warn User
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedUser && actionReason) {
                        onBanUser(selectedUser, actionReason);
                        setSelectedUser('');
                        setActionReason('');
                      }
                    }}
                    variant="outline"
                    className="flex-1 border-red-500 text-red-600 dark:text-red-400"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-2">
            {moderatorQueue.userSubmittedQuestions
              .filter(q => q.status === 'pending')
              .map(question => (
                <Card key={question.questionId.toString()} className="border-purple-200/50 dark:border-purple-800/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">Question #{question.questionId.toString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted by {question.submittedBy} on {new Date(question.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{question.votes} votes</Badge>
                        <Badge variant="secondary">{question.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onApproveQuestion(question.questionId)}
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => onRejectQuestion(question.questionId, 'Does not meet quality standards')}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500 text-red-600 dark:text-red-400"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="reports" className="space-y-2">
            {moderatorQueue.reportedContent
              .filter(r => r.status === 'pending')
              .map((report, idx) => (
                <Card key={idx} className="border-red-200/50 dark:border-red-800/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Flag className="h-4 w-4 text-red-500" />
                          <Badge variant="outline" className="capitalize">{report.contentType}</Badge>
                        </div>
                        <p className="text-sm font-semibold">Content ID: {report.contentId}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reported by {report.reportedBy}
                        </p>
                        <p className="text-sm mt-2">{report.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onResolveReport(report.contentId, 'resolved')}
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Take Action
                      </Button>
                      <Button
                        onClick={() => onResolveReport(report.contentId, 'dismissed')}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-2">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentActions.map(action => (
                <Card key={action.id} className="border-purple-200/50 dark:border-purple-800/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {action.actionType === 'ban' && <Ban className="h-4 w-4 text-red-500" />}
                      {action.actionType === 'warn' && <Flag className="h-4 w-4 text-yellow-500" />}
                      {action.actionType === 'promote' && <Award className="h-4 w-4 text-green-500" />}
                      {action.actionType === 'approve-question' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      <div>
                        <p className="text-sm font-semibold capitalize">{action.actionType.replace('-', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{action.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </p>
                      {action.reversible && (
                        <Badge variant="outline" className="text-xs mt-1">Reversible</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
