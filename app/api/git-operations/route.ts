import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { GitOperations } from '@/lib/git-operations';

const gitOps = new GitOperations();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { operation, workspaceId, commitMessage, repoUrl, branch, cloudStoragePath, githubToken } = body;

    logger.info(`Git operation requested: ${operation} for workspace ${workspaceId}`);

    switch (operation) {
      case 'clone':
        return await handleClone(repoUrl, branch, workspaceId, githubToken);
      
      case 'push':
        return await handlePush(workspaceId, repoUrl, branch, commitMessage, cloudStoragePath, githubToken);
      
      case 'pull':
        return await handlePull(workspaceId, repoUrl, branch, githubToken);
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Git operation error:', error);
    return NextResponse.json(
      { error: 'Git operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleClone(
  repoUrl: string,
  branch: string,
  workspaceId: string,
  githubToken?: string
): Promise<NextResponse> {
  try {
    logger.info(`Cloning repository ${repoUrl} branch ${branch}`);

    const result = await gitOps.cloneRepository({
      repoUrl,
      branch,
      workspaceId,
      githubToken,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Clone failed', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cloudStoragePath: result.cloudStoragePath,
      filesCount: result.filesCount,
      message: 'Repository cloned successfully',
    });
  } catch (error) {
    logger.error('Clone error:', error);
    return NextResponse.json(
      { error: 'Clone failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handlePush(
  workspaceId: string,
  repoUrl: string,
  branch: string,
  commitMessage: string,
  cloudStoragePath: string,
  githubToken?: string
): Promise<NextResponse> {
  try {
    logger.info(`Pushing workspace ${workspaceId} with message: ${commitMessage}`);

    const result = await gitOps.pushToRepository(
      {
        repoUrl,
        branch,
        workspaceId,
        githubToken,
      },
      commitMessage,
      cloudStoragePath
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Push failed', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commitHash: result.commitHash,
      message: 'Changes pushed successfully',
    });
  } catch (error) {
    logger.error('Push error:', error);
    return NextResponse.json(
      { error: 'Push failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handlePull(
  workspaceId: string,
  repoUrl: string,
  branch: string,
  githubToken?: string
): Promise<NextResponse> {
  try {
    logger.info(`Pulling latest changes for workspace ${workspaceId}`);

    const result = await gitOps.pullFromRepository({
      repoUrl,
      branch,
      workspaceId,
      githubToken,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Pull failed', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filesChanged: result.filesChanged,
      message: 'Latest changes pulled successfully',
    });
  } catch (error) {
    logger.error('Pull error:', error);
    return NextResponse.json(
      { error: 'Pull failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
