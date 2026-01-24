'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye } from 'lucide-react';
import { CHEAT_DETECTION } from '@/lib/constants';
import type { CheatEvent } from '@/types/extended-types';

interface CheatMonitorProps {
  competitionId: bigint;
  onCheatDetected: (event: CheatEvent) => void;
  isActive: boolean;
}

export function CheatMonitor({ competitionId, onCheatDetected, isActive }: CheatMonitorProps): JSX.Element {
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [pasteCount, setPasteCount] = useState<number>(0);
  const [suspicionLevel, setSuspicionLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [events, setEvents] = useState<CheatEvent[]>([]);

  const reportEvent = useCallback((type: CheatEvent['type'], severity: CheatEvent['severity'], details: string): void => {
    const event: CheatEvent = {
      type,
      timestamp: new Date(),
      severity,
      details,
    };
    setEvents(prev => [...prev, event]);
    onCheatDetected(event);
  }, [onCheatDetected]);

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount > CHEAT_DETECTION.TAB_SWITCH_LIMIT) {
            reportEvent('tab-switch', 'high', `Tab switched ${newCount} times`);
            setSuspicionLevel('high');
          } else if (newCount > 1) {
            reportEvent('tab-switch', 'medium', `Tab switched ${newCount} times`);
            setSuspicionLevel('medium');
          }
          return newCount;
        });
      }
    };

    const handlePaste = (e: ClipboardEvent): void => {
      setPasteCount(prev => {
        const newCount = prev + 1;
        const pastedText = e.clipboardData?.getData('text') || '';
        if (newCount >= CHEAT_DETECTION.PASTE_WARNING_THRESHOLD) {
          reportEvent('paste', 'high', `Paste detected: ${pastedText.substring(0, 50)}...`);
          setSuspicionLevel('high');
        } else {
          reportEvent('paste', 'low', `Paste detected: ${pastedText.substring(0, 50)}...`);
        }
        return newCount;
      });
    };

    const handleKeyPattern = (e: KeyboardEvent): void => {
      // Detect suspicious key patterns (very fast typing, etc.)
      const typingSpeed = performance.now();
      // You could implement more sophisticated detection here
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyPattern);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyPattern);
    };
  }, [isActive, reportEvent]);

  const getSuspicionColor = (): string => {
    switch (suspicionLevel) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  const getSuspicionBadge = (): JSX.Element => {
    switch (suspicionLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medium Risk</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-500 text-white">All Clear</Badge>;
    }
  };

  if (!isActive) {
    return <></>;
  }

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Fair Play Monitor</CardTitle>
          </div>
          {getSuspicionBadge()}
        </div>
        <CardDescription className="text-xs">
          Anti-cheat system is active to ensure fair competition
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
            <Eye className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold">{tabSwitchCount}</p>
            <p className="text-xs text-muted-foreground">Tab Switches</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{pasteCount}</p>
            <p className="text-xs text-muted-foreground">Paste Events</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
            <Shield className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className={`text-2xl font-bold ${getSuspicionColor()}`}>
              {suspicionLevel.toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">Risk Level</p>
          </div>
        </div>

        {events.length > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Events</p>
            {events.slice(-5).reverse().map((event, idx) => (
              <div key={idx} className="text-xs p-2 rounded bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between">
                <span className="text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}: {event.type}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    event.severity === 'high' ? 'border-red-500 text-red-600' :
                    event.severity === 'medium' ? 'border-yellow-500 text-yellow-600' :
                    'border-green-500 text-green-600'
                  }`}
                >
                  {event.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {suspicionLevel === 'high' && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
              ⚠️ Warning: Suspicious activity detected
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Your session is being monitored. Excessive violations may result in penalties.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
