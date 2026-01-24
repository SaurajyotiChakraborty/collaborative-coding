import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { operation, repoUrl, branch, workspaceId, commitMessage, files } = await request.json();

    const workspaceDir = join('/tmp/workspaces', workspaceId.toString());

    switch (operation) {
      case 'clone':
        return await handleClone(repoUrl, branch, workspaceDir);

      case 'pull':
        return await handlePull(workspaceDir);

      case 'push':
        return await handlePush(workspaceDir, commitMessage, files);

      case 'status':
        return await handleStatus(workspaceDir);

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Git operation error:', error);
    return NextResponse.json(
      { error: 'Git operation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleClone(repoUrl: string, branch: string, workspaceDir: string) {
  try {
    // Create workspace directory
    await mkdir(workspaceDir, { recursive: true });

    // Clone repository
    const { stdout, stderr } = await execAsync(
      `git clone --branch ${branch} ${repoUrl} ${workspaceDir}`,
      { timeout: 60000 }
    );

    // Install dependencies (if package.json exists)
    try {
      await execAsync('npm install', { cwd: workspaceDir, timeout: 120000 });
    } catch (e) {
      console.log('No package.json or install failed, continuing...');
    }

    return NextResponse.json({
      success: true,
      message: 'Repository cloned successfully',
      output: stdout
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Clone failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handlePull(workspaceDir: string) {
  try {
    const { stdout } = await execAsync('git pull', {
      cwd: workspaceDir,
      timeout: 30000
    });

    return NextResponse.json({
      success: true,
      message: 'Pulled latest changes',
      output: stdout
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Pull failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handlePush(workspaceDir: string, commitMessage: string, files: Record<string, string>) {
  try {
    // Write files
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = join(workspaceDir, filePath);
      await writeFile(fullPath, content, 'utf-8');
    }

    // Git add all
    await execAsync('git add .', { cwd: workspaceDir });

    // Git commit
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: workspaceDir });

    // Git push
    const { stdout } = await execAsync('git push', {
      cwd: workspaceDir,
      timeout: 30000
    });

    // Cleanup workspace
    await rm(workspaceDir, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      message: 'Changes pushed successfully',
      output: stdout
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Push failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleStatus(workspaceDir: string) {
  try {
    const { stdout } = await execAsync('git status --short', {
      cwd: workspaceDir
    });

    return NextResponse.json({
      success: true,
      status: stdout
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Status check failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
