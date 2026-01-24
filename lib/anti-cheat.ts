export interface AntiCheatMetrics {
    tabSwitchCount: number;
    pasteDetected: boolean;
    typingSpeed: number; // characters per second
    typingEntropy: number; // 0-1, higher = more human-like
    suspicionScore: number; // 0-100
    flags: string[];
}

export class AntiCheatMonitor {
    private keystrokes: number[] = [];
    private lastKeystrokeTime: number = 0;
    private pasteCount: number = 0;
    private tabSwitchCount: number = 0;

    recordKeystroke(timestamp: number) {
        if (this.lastKeystrokeTime > 0) {
            const interval = timestamp - this.lastKeystrokeTime;
            this.keystrokes.push(interval);

            // Keep only last 100 keystrokes
            if (this.keystrokes.length > 100) {
                this.keystrokes.shift();
            }
        }
        this.lastKeystrokeTime = timestamp;
    }

    recordPaste() {
        this.pasteCount++;
    }

    recordTabSwitch() {
        this.tabSwitchCount++;
    }

    calculateMetrics(): AntiCheatMetrics {
        const typingSpeed = this.calculateTypingSpeed();
        const typingEntropy = this.calculateTypingEntropy();
        const suspicionScore = this.calculateSuspicionScore(typingSpeed, typingEntropy);
        const flags = this.generateFlags(suspicionScore);

        return {
            tabSwitchCount: this.tabSwitchCount,
            pasteDetected: this.pasteCount > 0,
            typingSpeed,
            typingEntropy,
            suspicionScore,
            flags
        };
    }

    private calculateTypingSpeed(): number {
        if (this.keystrokes.length < 10) return 0;

        const avgInterval = this.keystrokes.reduce((a, b) => a + b, 0) / this.keystrokes.length;
        return avgInterval > 0 ? 1000 / avgInterval : 0; // chars per second
    }

    private calculateTypingEntropy(): number {
        if (this.keystrokes.length < 20) return 0.5;

        // Calculate variance in keystroke intervals
        const mean = this.keystrokes.reduce((a, b) => a + b, 0) / this.keystrokes.length;
        const variance = this.keystrokes.reduce((sum, interval) => {
            return sum + Math.pow(interval - mean, 2);
        }, 0) / this.keystrokes.length;

        const stdDev = Math.sqrt(variance);

        // Normalize to 0-1 range (higher variance = more human-like)
        // Typical human typing has stdDev between 50-200ms
        const normalizedEntropy = Math.min(stdDev / 200, 1);

        return normalizedEntropy;
    }

    private calculateSuspicionScore(typingSpeed: number, typingEntropy: number): number {
        let score = 0;

        // Tab switches (each switch adds 10 points, cap at 30)
        score += Math.min(this.tabSwitchCount * 10, 30);

        // Paste detection (20 points)
        if (this.pasteCount > 0) {
            score += 20;
        }

        // Abnormal typing speed (>10 chars/sec is suspicious, 20 points)
        if (typingSpeed > 10) {
            score += 20;
        }

        // Low entropy (too consistent, likely bot, 30 points)
        if (typingEntropy < 0.2 && this.keystrokes.length > 50) {
            score += 30;
        }

        return Math.min(score, 100);
    }

    private generateFlags(suspicionScore: number): string[] {
        const flags: string[] = [];

        if (this.tabSwitchCount >= 5) {
            flags.push('EXCESSIVE_TAB_SWITCHING');
        }
        if (this.pasteCount > 2) {
            flags.push('MULTIPLE_PASTE_EVENTS');
        }
        if (this.calculateTypingSpeed() > 10) {
            flags.push('ABNORMAL_TYPING_SPEED');
        }
        if (this.calculateTypingEntropy() < 0.2 && this.keystrokes.length > 50) {
            flags.push('LOW_TYPING_ENTROPY');
        }
        if (suspicionScore >= 70) {
            flags.push('HIGH_SUSPICION_SCORE');
        }

        return flags;
    }

    reset() {
        this.keystrokes = [];
        this.lastKeystrokeTime = 0;
        this.pasteCount = 0;
        this.tabSwitchCount = 0;
    }
}
