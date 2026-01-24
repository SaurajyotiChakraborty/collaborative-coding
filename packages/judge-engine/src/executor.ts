import { spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface ExecutionConfig {
    language: 'javascript' | 'python' | 'java' | 'cpp';
    code: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
    timeLimit?: number; // milliseconds
    memoryLimit?: number; // MB
}

export interface ExecutionResult {
    success: boolean;
    allPassed: boolean;
    results: Array<{
        passed: boolean;
        input: string;
        expected: string;
        actual: string | null;
        error: string | null;
        executionTime: number;
        memoryUsed: number;
    }>;
    totalTime: number;
    avgMemory: number;
    timeComplexity: string;
    spaceComplexity: string;
}

const LANGUAGE_CONFIG = {
    javascript: {
        extension: 'js',
        command: 'node',
        args: (file: string) => [file],
    },
    python: {
        extension: 'py',
        command: 'python3',
        args: (file: string) => [file],
    },
    java: {
        extension: 'java',
        command: 'javac',
        compileArgs: (file: string) => [file],
        runCommand: 'java',
        runArgs: (className: string) => [className],
    },
    cpp: {
        extension: 'cpp',
        command: 'g++',
        compileArgs: (file: string, output: string) => [file, '-o', output],
        runCommand: './',
        runArgs: (output: string) => [output],
    },
};

export class CodeExecutor {
    private sandboxDir: string;

    constructor(sandboxDir = '/sandbox') {
        this.sandboxDir = sandboxDir;
    }

    async execute(config: ExecutionConfig): Promise<ExecutionResult> {
        const executionId = randomUUID();
        const workDir = join(this.sandboxDir, executionId);

        try {
            await mkdir(workDir, { recursive: true });

            const results = [];
            let totalTime = 0;
            let totalMemory = 0;

            for (const testCase of config.testCases) {
                const result = await this.runSingleTest(
                    config,
                    testCase,
                    workDir,
                    executionId
                );
                results.push(result);
                totalTime += result.executionTime;
                totalMemory += result.memoryUsed;
            }

            const allPassed = results.every(r => r.passed);
            const avgMemory = totalMemory / results.length;

            // Estimate complexity (basic heuristic)
            const complexity = this.estimateComplexity(results, config.testCases);

            return {
                success: true,
                allPassed,
                results,
                totalTime,
                avgMemory,
                timeComplexity: complexity.time,
                spaceComplexity: complexity.space,
            };
        } catch (error) {
            throw new Error(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Cleanup
            await this.cleanup(workDir);
        }
    }

    private async runSingleTest(
        config: ExecutionConfig,
        testCase: { input: string; expectedOutput: string },
        workDir: string,
        executionId: string
    ) {
        const langConfig = LANGUAGE_CONFIG[config.language];
        const fileName = `solution_${executionId}.${langConfig.extension}`;
        const filePath = join(workDir, fileName);

        // Write code to file
        await writeFile(filePath, config.code);

        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;

        try {
            // Compile if needed
            if ('compileArgs' in langConfig && langConfig.compileArgs) {
                await this.runProcess(
                    langConfig.command,
                    langConfig.compileArgs(filePath),
                    workDir,
                    '',
                    config.timeLimit || 5000
                );
            }

            // Execute
            const command = 'runCommand' in langConfig ? langConfig.runCommand : langConfig.command;
            const args = 'runArgs' in langConfig
                ? langConfig.runArgs(fileName.replace(`.${langConfig.extension}`, ''))
                : langConfig.args(filePath);

            const output = await this.runProcess(
                command,
                args,
                workDir,
                testCase.input,
                config.timeLimit || 5000
            );

            const executionTime = Date.now() - startTime;
            const memoryUsed = (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024; // MB

            const actualOutput = output.trim();
            const expectedOutput = testCase.expectedOutput.trim();
            const passed = actualOutput === expectedOutput;

            return {
                passed,
                input: testCase.input,
                expected: expectedOutput,
                actual: actualOutput,
                error: null,
                executionTime,
                memoryUsed,
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                passed: false,
                input: testCase.input,
                expected: testCase.expectedOutput,
                actual: null,
                error: error instanceof Error ? error.message : 'Execution error',
                executionTime,
                memoryUsed: 0,
            };
        }
    }

    private runProcess(
        command: string,
        args: string[],
        cwd: string,
        input: string,
        timeout: number
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                cwd,
                timeout,
                killSignal: 'SIGKILL',
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            // Send input
            if (input) {
                process.stdin.write(input);
                process.stdin.end();
            }

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(stderr || `Process exited with code ${code}`));
                }
            });

            process.on('error', (error) => {
                reject(error);
            });

            // Timeout handling
            setTimeout(() => {
                process.kill('SIGKILL');
                reject(new Error('Execution timeout'));
            }, timeout);
        });
    }

    private estimateComplexity(
        results: Array<{ executionTime: number; memoryUsed: number }>,
        testCases: Array<{ input: string }>
    ) {
        // Simple heuristic based on execution time growth
        if (results.length < 2) {
            return { time: 'O(n)', space: 'O(1)' };
        }

        const times = results.map(r => r.executionTime);
        const inputSizes = testCases.map(tc => tc.input.length);

        // Calculate growth rate
        const growthRate = times[times.length - 1] / times[0];
        const sizeRatio = inputSizes[inputSizes.length - 1] / inputSizes[0];

        let timeComplexity = 'O(n)';
        if (growthRate > sizeRatio * sizeRatio) {
            timeComplexity = 'O(n²)';
        } else if (growthRate > sizeRatio * Math.log2(sizeRatio)) {
            timeComplexity = 'O(n log n)';
        } else if (growthRate < 2) {
            timeComplexity = 'O(1)';
        }

        // Memory complexity (simplified)
        const avgMemory = results.reduce((sum, r) => sum + r.memoryUsed, 0) / results.length;
        const spaceComplexity = avgMemory > 100 ? 'O(n)' : 'O(1)';

        return { time: timeComplexity, space: spaceComplexity };
    }

    private async cleanup(workDir: string) {
        try {
            const { rm } = await import('fs/promises');
            await rm(workDir, { recursive: true, force: true });
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
}
