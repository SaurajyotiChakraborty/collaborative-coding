/**
 * Cloud Storage Interface
 * Supports AWS S3, Cloudflare R2, or any S3-compatible storage
 */

export interface StorageFile {
  path: string;
  content: string | Buffer;
  contentType?: string;
}

export interface StorageProvider {
  upload(key: string, content: string | Buffer, contentType?: string): Promise<void>;
  download(key: string): Promise<string>;
  list(prefix: string): Promise<Array<{ key: string; path: string }>>;
  delete(key: string): Promise<void>;
  deleteFolder(prefix: string): Promise<void>;
}

/**
 * S3-Compatible Storage Provider
 * Works with AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.
 */
class S3StorageProvider implements StorageProvider {
  private client: any; // AWS S3 Client
  private bucket: string;

  constructor(config: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    region?: string;
    bucket: string;
  }) {
    // For now, this is a placeholder
    // In production, you would initialize the S3 client here:
    // this.client = new S3Client({ ... });
    this.bucket = config.bucket;
    
    console.log('S3 Storage initialized with bucket:', this.bucket);
  }

  async upload(key: string, content: string | Buffer, contentType = 'application/octet-stream'): Promise<void> {
    // TODO: Implement actual S3 upload
    // await this.client.send(new PutObjectCommand({
    //   Bucket: this.bucket,
    //   Key: key,
    //   Body: content,
    //   ContentType: contentType,
    // }));
    
    console.log(`[Cloud Storage] Upload: ${key}`);
  }

  async download(key: string): Promise<string> {
    // TODO: Implement actual S3 download
    // const response = await this.client.send(new GetObjectCommand({
    //   Bucket: this.bucket,
    //   Key: key,
    // }));
    // return response.Body.transformToString();
    
    console.log(`[Cloud Storage] Download: ${key}`);
    return '';
  }

  async list(prefix: string): Promise<Array<{ key: string; path: string }>> {
    // TODO: Implement actual S3 list
    // const response = await this.client.send(new ListObjectsV2Command({
    //   Bucket: this.bucket,
    //   Prefix: prefix,
    // }));
    // return (response.Contents || []).map(obj => ({
    //   key: obj.Key!,
    //   path: obj.Key!.replace(prefix, ''),
    // }));
    
    console.log(`[Cloud Storage] List: ${prefix}`);
    return [];
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement actual S3 delete
    // await this.client.send(new DeleteObjectCommand({
    //   Bucket: this.bucket,
    //   Key: key,
    // }));
    
    console.log(`[Cloud Storage] Delete: ${key}`);
  }

  async deleteFolder(prefix: string): Promise<void> {
    const files = await this.list(prefix);
    
    // TODO: Implement batch delete
    // await Promise.all(files.map(file => this.delete(file.key)));
    
    console.log(`[Cloud Storage] Delete folder: ${prefix} (${files.length} files)`);
  }
}

/**
 * In-Memory Storage Provider (for development/testing)
 */
class InMemoryStorageProvider implements StorageProvider {
  private storage: Map<string, { content: string | Buffer; contentType: string }>;

  constructor() {
    this.storage = new Map();
  }

  async upload(key: string, content: string | Buffer, contentType = 'application/octet-stream'): Promise<void> {
    this.storage.set(key, { content, contentType });
    console.log(`[Memory Storage] Uploaded: ${key}`);
  }

  async download(key: string): Promise<string> {
    const item = this.storage.get(key);
    if (!item) {
      throw new Error(`File not found: ${key}`);
    }
    console.log(`[Memory Storage] Downloaded: ${key}`);
    return typeof item.content === 'string' ? item.content : item.content.toString('utf-8');
  }

  async list(prefix: string): Promise<Array<{ key: string; path: string }>> {
    const results: Array<{ key: string; path: string }> = [];
    
    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) {
        results.push({
          key,
          path: key.replace(prefix, ''),
        });
      }
    }
    
    console.log(`[Memory Storage] Listed: ${prefix} (${results.length} files)`);
    return results;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
    console.log(`[Memory Storage] Deleted: ${key}`);
  }

  async deleteFolder(prefix: string): Promise<void> {
    const keys = Array.from(this.storage.keys()).filter(key => key.startsWith(prefix));
    keys.forEach(key => this.storage.delete(key));
    console.log(`[Memory Storage] Deleted folder: ${prefix} (${keys.length} files)`);
  }
}

/**
 * Get storage provider instance
 * Uses environment variables to determine which provider to use
 */
export function getStorageProvider(): StorageProvider {
  // Check if S3 credentials are provided
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET;
  const endpoint = process.env.AWS_S3_ENDPOINT || process.env.R2_ENDPOINT;
  const region = process.env.AWS_REGION || 'auto';

  if (accessKeyId && secretAccessKey && bucket) {
    return new S3StorageProvider({
      accessKeyId,
      secretAccessKey,
      endpoint,
      region,
      bucket,
    });
  }

  // Fall back to in-memory storage for development
  console.warn('No cloud storage credentials found, using in-memory storage');
  return new InMemoryStorageProvider();
}

/**
 * Helper functions for workspace file management
 */
export class WorkspaceStorage {
  private provider: StorageProvider;

  constructor(provider?: StorageProvider) {
    this.provider = provider || getStorageProvider();
  }

  /**
   * Save workspace files to cloud storage
   */
  async saveWorkspace(workspaceId: string, files: StorageFile[]): Promise<string> {
    const timestamp = Date.now();
    const storageKey = `workspaces/${workspaceId}/${timestamp}`;

    await Promise.all(
      files.map(file =>
        this.provider.upload(
          `${storageKey}${file.path}`,
          file.content,
          file.contentType || 'text/plain'
        )
      )
    );

    return storageKey;
  }

  /**
   * Load workspace files from cloud storage
   */
  async loadWorkspace(storageKey: string): Promise<StorageFile[]> {
    const fileList = await this.provider.list(storageKey);
    
    const files = await Promise.all(
      fileList.map(async ({ key, path }) => ({
        path,
        content: await this.provider.download(key),
      }))
    );

    return files;
  }

  /**
   * Delete workspace files from cloud storage
   */
  async deleteWorkspace(storageKey: string): Promise<void> {
    await this.provider.deleteFolder(storageKey);
  }

  /**
   * Save a single file
   */
  async saveFile(workspaceId: string, filePath: string, content: string): Promise<void> {
    const key = `workspaces/${workspaceId}/current${filePath}`;
    await this.provider.upload(key, content, this.getContentType(filePath));
  }

  /**
   * Load a single file
   */
  async loadFile(workspaceId: string, filePath: string): Promise<string> {
    const key = `workspaces/${workspaceId}/current${filePath}`;
    return await this.provider.download(key);
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      'ts': 'text/typescript',
      'tsx': 'text/typescript',
      'js': 'text/javascript',
      'jsx': 'text/javascript',
      'json': 'application/json',
      'md': 'text/markdown',
      'css': 'text/css',
      'html': 'text/html',
    };
    return types[ext || ''] || 'text/plain';
  }
}
