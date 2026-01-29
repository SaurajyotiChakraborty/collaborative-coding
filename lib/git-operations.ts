import simpleGit, { type SimpleGit, type SimpleGitOptions } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { WorkspaceStorage, type StorageFile } from './cloud-storage';

export interface GitConfig {
  repoUrl: string;
  branch: string;
  workspaceId: string;
  githubToken?: string;
  targetDir?: string;
  preserve?: boolean;
}

export interface CloneResult {
  success: boolean;
  cloudStoragePath: string;
  filesCount: number;
  files?: StorageFile[];
  error?: string;
}

export interface PushResult {
  success: boolean;
  commitHash?: string;
  error?: string;
}

export interface PullResult {
  success: boolean;
  filesChanged: number;
  error?: string;
}

/**
 * Git Operations Manager
 * Handles cloning, pushing, and pulling repositories
 */
export class GitOperations {
  private storage: WorkspaceStorage;
  private tempDir: string;

  constructor() {
    this.storage = new WorkspaceStorage();
    this.tempDir = '/tmp/workspaces';
  }

  /**
   * Clone a repository and upload to cloud storage
   */
  async cloneRepository(config: GitConfig): Promise<CloneResult> {
    const workspacePath = path.join(this.tempDir, config.workspaceId);

    try {
      // Ensure temp directory exists
      await fs.mkdir(this.tempDir, { recursive: true });

      // Configure git options - Use tempDir as safe base, or parent of targetDir
      // If targetDir is provided, we still need a valid CWD to spawn the process.
      const options: any = {
        baseDir: this.tempDir,
        binary: 'git',
        maxConcurrentProcesses: 6,
      };

      const git: SimpleGit = simpleGit(options);

      // Determine clone path
      const clonePath = config.targetDir || workspacePath;

      // Clone the repository
      const repoUrl = this.getAuthenticatedUrl(config.repoUrl, config.githubToken);
      await git.clone(repoUrl, clonePath, ['--branch', config.branch, '--single-branch']);

      console.log(`Repository cloned to: ${clonePath}`);

      // Run npm install if package.json exists
      const packageJsonPath = path.join(clonePath, 'package.json');
      try {
        await fs.access(packageJsonPath);
        console.log('Running npm install...');

        // TODO: Execute npm install using child_process
        // const { exec } = require('child_process');
        // await new Promise((resolve, reject) => {
        //   exec('npm install', { cwd: workspacePath }, (error, stdout, stderr) => {
        //     if (error) reject(error);
        //     else resolve(stdout);
        //   });
        // });
      } catch {
        console.log('No package.json found, skipping npm install');
      }

      // Read all files and upload to cloud storage
      const files = await this.readDirectoryRecursive(clonePath);
      const storageKey = await this.storage.saveWorkspace(config.workspaceId, files);

      // Cleanup local files unless preserved
      if (!config.preserve) {
        await this.cleanupDirectory(workspacePath);
      }

      return {
        success: true,
        cloudStoragePath: storageKey,
        filesCount: files.length,
        files: files,
      };
    } catch (error) {
      console.error('Clone error:', error);

      // Cleanup on failure
      try {
        await this.cleanupDirectory(workspacePath);
      } catch { }

      return {
        success: false,
        cloudStoragePath: '',
        filesCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Push changes to repository
   */
  async pushToRepository(config: GitConfig, commitMessage: string, cloudStoragePath: string): Promise<PushResult> {
    const workspacePath = path.join(this.tempDir, config.workspaceId);

    try {
      // Download files from cloud storage
      const files = await this.storage.loadWorkspace(cloudStoragePath);

      // Write files to temporary directory
      await fs.mkdir(workspacePath, { recursive: true });
      await Promise.all(
        files.map(file => this.writeFile(workspacePath, file.path, typeof file.content === 'string' ? file.content : file.content.toString()))
      );

      // Configure git
      const git: SimpleGit = simpleGit(workspacePath);

      // Configure user (required for commits)
      await git.addConfig('user.name', 'Optimize Coder Bot');
      await git.addConfig('user.email', 'bot@optimizecoder.com');

      // Stage all changes
      await git.add('.');

      // Commit changes
      const commitResult = await git.commit(commitMessage);
      console.log('Commit created:', commitResult.commit);

      // Push to remote
      const repoUrl = this.getAuthenticatedUrl(config.repoUrl, config.githubToken);
      await git.push(repoUrl, config.branch);

      // Cleanup
      await this.cleanupDirectory(workspacePath);

      return {
        success: true,
        commitHash: commitResult.commit,
      };
    } catch (error) {
      console.error('Push error:', error);

      // Cleanup on failure
      try {
        await this.cleanupDirectory(workspacePath);
      } catch { }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Pull latest changes from repository
   */
  async pullFromRepository(config: GitConfig): Promise<PullResult> {
    const workspacePath = path.join(this.tempDir, config.workspaceId);

    try {
      // Download current files from cloud storage
      const currentStorageKey = `workspaces/${config.workspaceId}/current`;
      let hasExistingFiles = false;

      try {
        await this.storage.loadWorkspace(currentStorageKey);
        hasExistingFiles = true;
      } catch {
        console.log('No existing files in cloud storage');
      }

      // Clone fresh copy
      await fs.mkdir(this.tempDir, { recursive: true });
      const git: SimpleGit = simpleGit(this.tempDir);

      const repoUrl = this.getAuthenticatedUrl(config.repoUrl, config.githubToken);
      await git.clone(repoUrl, workspacePath, ['--branch', config.branch, '--single-branch']);

      // Read files
      const files = await this.readDirectoryRecursive(workspacePath);

      // Upload to cloud storage
      await this.storage.saveWorkspace(config.workspaceId, files);

      // Cleanup
      await this.cleanupDirectory(workspacePath);

      return {
        success: true,
        filesChanged: files.length,
      };
    } catch (error) {
      console.error('Pull error:', error);

      // Cleanup on failure
      try {
        await this.cleanupDirectory(workspacePath);
      } catch { }

      return {
        success: false,
        filesChanged: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add GitHub token to repository URL for authentication
   */
  private getAuthenticatedUrl(repoUrl: string, token?: string): string {
    if (!token) return repoUrl;

    // Convert HTTPS URL to authenticated URL
    // https://github.com/user/repo.git -> https://token@github.com/user/repo.git
    return repoUrl.replace('https://', `https://${token}@`);
  }

  /**
   * Recursively read all files in a directory
   */
  private async readDirectoryRecursive(dirPath: string, relativePath = ''): Promise<StorageFile[]> {
    const files: StorageFile[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      // Skip .git directory and node_modules
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await this.readDirectoryRecursive(fullPath, relPath);
        files.push(...subFiles);
      } else {
        const buffer = await fs.readFile(fullPath);
        // Check for null bytes to detect binary files
        const isBinary = buffer.includes(0);

        files.push({
          path: `/${relPath.replace(/\\/g, '/')}`,
          content: isBinary ? '[Binary File - Cannot display in editor]' : buffer.toString('utf-8'),
        });
      }
    }

    return files;
  }

  /**
   * Write a file to the file system
   */
  private async writeFile(basePath: string, filePath: string, content: string): Promise<void> {
    const fullPath = path.join(basePath, filePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Cleanup temporary directory
   */
  private async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      console.log(`Cleaned up: ${dirPath}`);
    } catch (error) {
      console.error(`Failed to cleanup ${dirPath}:`, error);
    }
  }
}
