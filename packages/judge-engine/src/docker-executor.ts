import Docker from 'dockerode';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';

const docker = new Docker();

export interface ExecutionConfig {
    language: 'javascript' | 'python' | 'java';
    code: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
    timeLimit?: number; // milliseconds
    memoryLimit?: number; // MB
}

export interface ExecutionResult {
    success: boolean;
    allPassed: boolean;
    passedCount: number;
    totalCount: number;
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

const LANGUAGE_CONFIG: Record<string, {
    image: string;
    extension: string;
    command: string[];
    needsCompile?: boolean;
    compileCommand?: string[];
}> = {
    javascript: {
        image: 'judge-js',
        extension: 'js',
        command: ['node', '/code/solution.js'],
    },
    python: {
        image: 'judge-python',
        extension: 'py',
        command: ['python3', '/code/solution.py'],
    },
    java: {
        image: 'judge-java',
        extension: 'java',
        command: ['java', 'Solution'],
        needsCompile: true,
        compileCommand: ['javac', '/code/Solution.java'],
    },
};

export class DockerCodeExecutor {
    async execute(config: ExecutionConfig): Promise<ExecutionResult> {
        const executionId = randomUUID();
        const workDir = join(tmpdir(), 'code-execution', executionId);

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
            const passedCount = results.filter(r => r.passed).length;
            const avgMemory = totalMemory / results.length;

            // Estimate complexity
            const complexity = this.estimateComplexity(results);

            return {
                success: true,
                allPassed,
                passedCount,
                totalCount: results.length,
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
        const fileName = `solution.${langConfig.extension}`;
        const filePath = join(workDir, fileName);

        // For JavaScript, wrap the code to automatically call the function with input
        let finalCode = config.code;
        if (config.language === 'javascript') {
            // Simple heuristic to find the primary function name (e.g., "function twoSum")
            const funcMatch = config.code.match(/function\s+([a-zA-Z0-9_]+)/);
            if (funcMatch) {
                const funcName = funcMatch[1];
                finalCode = `
${config.code}
// Driver code
try {
    const input = [${testCase.input}];
    const result = ${funcName}(...input);
    process.stdout.write(JSON.stringify(result));
} catch (e) {
    process.stderr.write(e.message);
    process.exit(1);
}
                `;
            }
        }

        // Write code to file
        await writeFile(filePath, finalCode);

        const startTime = Date.now();

        try {
            // Compile if needed (Java)
            if (langConfig.needsCompile && langConfig.compileCommand) {
                await this.runInContainer(
                    langConfig.image,
                    langConfig.compileCommand,
                    workDir,
                    '',
                    5000,
                    config.memoryLimit || 256
                );
            }

            // Execute
            const output = await this.runInContainer(
                langConfig.image,
                langConfig.command,
                workDir,
                testCase.input,
                config.timeLimit || 5000,
                config.memoryLimit || 256
            );

            const executionTime = Date.now() - startTime;
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
                memoryUsed: 0, // Docker stats would be needed for accurate memory
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

    private async runInContainer(
        image: string,
        command: string[],
        workDir: string,
        input: string,
        timeout: number,
        memoryLimit: number
    ): Promise<string> {
        const container = await docker.createContainer({
            Image: image,
            Cmd: command,
            HostConfig: {
                Memory: memoryLimit * 1024 * 1024, // Convert MB to bytes
                NanoCpus: 1000000000, // 1 CPU
                NetworkMode: 'none', // No network access
                Binds: [`${workDir}:/code:ro`], // Read-only mount
                AutoRemove: true, // Auto-remove after execution
            },
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,
            StdinOnce: true,
            Tty: true,
        });

        await container.start();

        // Send input if provided
        if (input) {
            const stream = await container.attach({
                stream: true,
                stdin: true,
                stdout: true,
                stderr: true,
            });
            stream.write(input);
            stream.end();
        }

        // Wait for container with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                container.kill().catch(() => { });
                reject(new Error('Execution timeout'));
            }, timeout);
        });

        const execPromise = container.wait().then(async () => {
            const logs = await container.logs({
                stdout: true,
                stderr: true,
            });
            return logs.toString();
        });

        try {
            const output = await Promise.race([execPromise, timeoutPromise]);
            return output;
        } catch (error) {
            await container.kill().catch(() => { });
            throw error;
        }
    }

    private estimateComplexity(
        results: Array<{ executionTime: number; memoryUsed: number }>
    ) {
        if (results.length < 2) {
            return { time: 'O(n)', space: 'O(1)' };
        }

        const times = results.map(r => r.executionTime);
        const growthRate = times[times.length - 1] / (times[0] || 1);

        let timeComplexity = 'O(n)';
        if (growthRate > 4) {
            timeComplexity = 'O(n²)';
        } else if (growthRate > 2) {
            timeComplexity = 'O(n log n)';
        } else if (growthRate < 1.5) {
            timeComplexity = 'O(1)';
        }

        return { time: timeComplexity, space: 'O(1)' };
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
