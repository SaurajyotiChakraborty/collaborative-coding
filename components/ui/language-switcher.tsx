'use client';

import * as React from 'react';
import { useLingoContext } from '@lingo.dev/compiler/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export function LanguageSwitcher({ isExpanded = true }: { isExpanded?: boolean }) {
    const { locale: currentLocale, setLocale } = useLingoContext();

    const handleLanguageChange = (code: any) => {
        setLocale(code);
    };

    const currentLang = languages.find((lang) => lang.code === currentLocale) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size={isExpanded ? 'default' : 'icon'}
                    className={cn(
                        'w-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300',
                        isExpanded ? 'justify-start' : 'justify-center'
                    )}
                >
                    <Languages className={cn('h-5 w-5', isExpanded && 'mr-3')} />
                    {isExpanded && (
                        <span className="flex-1 text-left font-medium">
                            {currentLang.label} {currentLang.flag}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/20">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                            'flex items-center justify-between cursor-pointer',
                            currentLocale === lang.code && 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold'
                        )}
                    >
                        <span>{lang.label}</span>
                        <span>{lang.flag}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
