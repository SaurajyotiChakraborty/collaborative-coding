'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Home,
    Trophy,
    Code2,
    Users,
    Shield,
    Bell,
    Menu,
    X,
    User
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" /> },
    { name: 'Compete', href: '/compete', icon: <Code2 className="h-4 w-4" /> },
    { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="h-4 w-4" /> },
    { name: 'Workspace', href: '/workspace', icon: <Users className="h-4 w-4" /> },
    { name: 'Profile', href: '/profile', icon: <User className="h-4 w-4" /> },
    { name: 'Admin', href: '/admin', icon: <Shield className="h-4 w-4" />, adminOnly: true },
];

export function MainNav() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="border-b bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <Code2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl gradient-text">Optimize Coder</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        className={`gap-2 ${isActive ? 'bg-purple-600' : ''}`}
                                    >
                                        {item.icon}
                                        {item.name}
                                        {item.badge && (
                                            <Badge variant="secondary" className="ml-1">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - Notifications & Profile */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
                        </Button>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        className={`w-full justify-start gap-2 ${isActive ? 'bg-purple-600' : ''}`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </nav>
    );
}
