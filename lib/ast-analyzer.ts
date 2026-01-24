import * as ts from 'typescript';

export interface ComplexityAnalysis {
    timeComplexity: string;
    spaceComplexity: string;
    confidence: number;
    details: {
        loopDepth: number;
        recursionDetected: boolean;
        dataStructures: string[];
        algorithmPattern?: string;
    };
}

export class ASTComplexityAnalyzer {
    analyze(code: string, language: 'javascript' | 'typescript' | 'python'): ComplexityAnalysis {
        if (language === 'javascript' || language === 'typescript') {
            return this.analyzeTypeScript(code);
        } else if (language === 'python') {
            return this.analyzePython(code);
        }

        return this.getDefaultAnalysis();
    }

    private analyzeTypeScript(code: string): ComplexityAnalysis {
        const sourceFile = ts.createSourceFile(
            'temp.ts',
            code,
            ts.ScriptTarget.Latest,
            true
        );

        let maxLoopDepth = 0;
        let currentLoopDepth = 0;
        let recursionDetected = false;
        const dataStructures: Set<string> = new Set();
        const functionCalls: Set<string> = new Set();

        const visit = (node: ts.Node) => {
            // Detect loops
            if (
                ts.isForStatement(node) ||
                ts.isWhileStatement(node) ||
                ts.isDoStatement(node) ||
                ts.isForOfStatement(node) ||
                ts.isForInStatement(node)
            ) {
                currentLoopDepth++;
                maxLoopDepth = Math.max(maxLoopDepth, currentLoopDepth);
                ts.forEachChild(node, visit);
                currentLoopDepth--;
                return;
            }

            // Detect recursion
            if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
                const functionName = node.name?.getText(sourceFile);
                if (functionName) {
                    const checkRecursion = (n: ts.Node) => {
                        if (ts.isCallExpression(n)) {
                            const callName = n.expression.getText(sourceFile);
                            if (callName === functionName) {
                                recursionDetected = true;
                            }
                        }
                        ts.forEachChild(n, checkRecursion);
                    };
                    ts.forEachChild(node, checkRecursion);
                }
            }

            // Detect data structures
            if (ts.isNewExpression(node)) {
                const typeName = node.expression.getText(sourceFile);
                if (['Map', 'Set', 'Array', 'Object'].includes(typeName)) {
                    dataStructures.add(typeName);
                }
            }

            // Detect method calls
            if (ts.isCallExpression(node)) {
                const callText = node.expression.getText(sourceFile);
                functionCalls.add(callText);
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        // Estimate complexity
        let timeComplexity = 'O(1)';
        let confidence = 0.7;

        if (recursionDetected) {
            // Check for divide-and-conquer patterns
            if (code.includes('Math.floor') && code.includes('/')) {
                timeComplexity = 'O(log n)';
                confidence = 0.6;
            } else {
                timeComplexity = 'O(2^n)';
                confidence = 0.5;
            }
        } else if (maxLoopDepth === 3) {
            timeComplexity = 'O(n³)';
            confidence = 0.8;
        } else if (maxLoopDepth === 2) {
            timeComplexity = 'O(n²)';
            confidence = 0.8;
        } else if (maxLoopDepth === 1) {
            // Check for sorting
            if (functionCalls.has('sort') || code.includes('.sort(')) {
                timeComplexity = 'O(n log n)';
                confidence = 0.9;
            } else {
                timeComplexity = 'O(n)';
                confidence = 0.8;
            }
        }

        // Space complexity
        let spaceComplexity = 'O(1)';
        if (dataStructures.has('Map') || dataStructures.has('Set') || dataStructures.has('Array')) {
            spaceComplexity = 'O(n)';
        }
        if (recursionDetected) {
            spaceComplexity = 'O(n)'; // Call stack
        }

        return {
            timeComplexity,
            spaceComplexity,
            confidence,
            details: {
                loopDepth: maxLoopDepth,
                recursionDetected,
                dataStructures: Array.from(dataStructures),
                algorithmPattern: this.detectAlgorithmPattern(code, functionCalls)
            }
        };
    }

    private analyzePython(code: string): ComplexityAnalysis {
        // Simplified Python analysis using regex patterns
        const forLoops = (code.match(/for\s+\w+\s+in/g) || []).length;
        const whileLoops = (code.match(/while\s+/g) || []).length;
        const recursion = /def\s+(\w+).*:\s*(?:.*\n)*.*\1\(/m.test(code);

        const maxLoopDepth = this.estimateLoopDepth(code);

        let timeComplexity = 'O(1)';
        if (recursion) {
            timeComplexity = 'O(2^n)';
        } else if (maxLoopDepth >= 2) {
            timeComplexity = 'O(n²)';
        } else if (maxLoopDepth === 1) {
            timeComplexity = 'O(n)';
        }

        const dataStructures = [];
        if (code.includes('dict(') || code.includes('{}')) dataStructures.push('dict');
        if (code.includes('set(')) dataStructures.push('set');
        if (code.includes('list(') || code.includes('[]')) dataStructures.push('list');

        return {
            timeComplexity,
            spaceComplexity: dataStructures.length > 0 ? 'O(n)' : 'O(1)',
            confidence: 0.6,
            details: {
                loopDepth: maxLoopDepth,
                recursionDetected: recursion,
                dataStructures,
            }
        };
    }

    private estimateLoopDepth(code: string): number {
        const lines = code.split('\n');
        let maxDepth = 0;
        let currentDepth = 0;

        for (const line of lines) {
            if (/^\s*(for|while)\s+/.test(line)) {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            // Simple heuristic: dedent reduces depth
            if (line.trim() && !line.startsWith(' ') && currentDepth > 0) {
                currentDepth = 0;
            }
        }

        return maxDepth;
    }

    private detectAlgorithmPattern(code: string, functionCalls: Set<string>): string | undefined {
        if (code.includes('sort') || functionCalls.has('sort')) {
            return 'Sorting';
        }
        if (code.includes('binary') || (code.includes('Math.floor') && code.includes('/'))) {
            return 'Binary Search';
        }
        if (code.includes('dp') || code.includes('memo')) {
            return 'Dynamic Programming';
        }
        if (code.includes('dfs') || code.includes('bfs')) {
            return 'Graph Traversal';
        }
        return undefined;
    }

    private getDefaultAnalysis(): ComplexityAnalysis {
        return {
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            confidence: 0.3,
            details: {
                loopDepth: 0,
                recursionDetected: false,
                dataStructures: []
            }
        };
    }
}

export function calculateComplexityScore(analysis: ComplexityAnalysis): number {
    const complexityScores: Record<string, number> = {
        'O(1)': 100,
        'O(log n)': 90,
        'O(n)': 80,
        'O(n log n)': 70,
        'O(n²)': 50,
        'O(n³)': 30,
        'O(2^n)': 10,
    };

    const timeScore = complexityScores[analysis.timeComplexity] || 50;
    const spaceScore = complexityScores[analysis.spaceComplexity] || 50;

    // Weighted average (time is more important)
    const score = (timeScore * 0.7 + spaceScore * 0.3) * analysis.confidence;

    return Math.round(score);
}
