'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    getAllUsers,
    banUser,
    unbanUser,
    promoteToAdmin
} from '@/app/actions/admin';
import { Loader2, Search, UserMinus, UserCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadUsers();
    }, [page]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const res = await getAllUsers(page);
            if (res.success) {
                setUsers(res.users || []);
                setTotalPages(res.pages || 1);
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBan = async (userId: string) => {
        const reason = prompt('Reason for banning:');
        if (!reason) return;

        try {
            const res = await banUser(userId, reason);
            if (res.success) {
                toast.success('User banned');
                loadUsers();
            }
        } catch (error) {
            toast.error('Failed to ban user');
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            const res = await unbanUser(userId);
            if (res.success) {
                toast.success('User unbanned');
                loadUsers();
            }
        } catch (error) {
            toast.error('Failed to unban user');
        }
    };

    const handlePromote = async (userId: string) => {
        if (!confirm('Promote this user to Admin? This cannot be undone via UI.')) return;

        try {
            const res = await promoteToAdmin(userId);
            if (res.success) {
                toast.success('User promoted to Admin');
                loadUsers();
            }
        } catch (error) {
            toast.error('Failed to promote user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="glass-strong border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Monitor and manage platform users</CardDescription>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by username or email..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>
                ) : (
                    <div className="space-y-4">
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">User</th>
                                        <th className="text-left p-4 font-semibold">Role</th>
                                        <th className="text-left p-4 font-semibold">Rating</th>
                                        <th className="text-left p-4 font-semibold">Status</th>
                                        <th className="text-right p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium">{user.username}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4 font-mono">{user.rating}</td>
                                            <td className="p-4">
                                                {user.isCheater ? (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        Banned
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1 border-green-200">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        Active
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {user.role !== 'Admin' && (
                                                        <Button size="sm" variant="outline" onClick={() => handlePromote(user.id)} title="Promote to Admin">
                                                            <ShieldCheck className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {user.isCheater ? (
                                                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleUnban(user.id)} title="Unban User">
                                                            <UserCheck className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleBan(user.id)} title="Ban User">
                                                            <UserMinus className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                    Previous
                                </Button>
                                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
