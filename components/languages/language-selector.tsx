'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code2, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (languageId: number, languageName: string) => void;
}

export function LanguageSelector({ selectedLanguage, onSelectLanguage }: LanguageSelectorProps): JSX.Element {
  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-purple-500" />
          <CardTitle className="gradient-text">Select Language</CardTitle>
        </div>
        <CardDescription>Choose your preferred programming language</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTED_LANGUAGES.map(lang => (
            <Button
              key={lang.id}
              variant={selectedLanguage === lang.name ? 'default' : 'outline'}
              onClick={() => onSelectLanguage(lang.id, lang.name)}
              className={`h-auto py-3 justify-start ${
                selectedLanguage === lang.name ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{lang.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{lang.displayName}</p>
                  <p className="text-xs opacity-75">{lang.version}</p>
                </div>
                {selectedLanguage === lang.name && (
                  <Check className="h-5 w-5" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
