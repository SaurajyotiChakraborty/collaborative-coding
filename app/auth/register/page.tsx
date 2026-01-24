'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, User, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';

export default function RegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const result = await registerUser(username.trim(), email.trim(), password.trim());

            if (!result.success) {
                toast.error(result.error || 'Registration failed');
                return;
            }

            toast.success('Registration successful! Signing you in...');

            // Automatically sign in after registration
            const signInResult = await signIn('credentials', {
                email: email.trim(),
                password: password.trim(),
                redirect: false,
            });

            if (signInResult?.error) {
                toast.error('Registration successful but sign in failed. Please sign in manually.');
                router.push('/auth/signin');
            } else if (signInResult?.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'github' | 'google') => {
        setIsLoading(true);
        try {
            await signIn(provider, { callbackUrl: '/dashboard' });
        } catch (error) {
            console.error(`${provider} sign in error:`, error);
            toast.error(`Failed to sign in with ${provider}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
            <Card className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                        Join Optimize Coder
                    </CardTitle>
                    <CardDescription>Create your account to start competing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password (min 6 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuthSignIn('github')}
                            disabled={isLoading}
                            className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuthSignIn('google')}
                            disabled={isLoading}
                            className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link
                            href="/auth/signin"
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        >
                            Sign in here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
