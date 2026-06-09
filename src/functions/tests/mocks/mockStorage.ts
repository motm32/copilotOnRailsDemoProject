import type { IStorageService } from '../../src/services/interfaces/storage.js';

export class MockStorageService implements IStorageService {
  private store = new Map<string, Buffer>();

  async upload(
    containerName: string,
    blobName: string,
    content: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `${containerName}/${blobName}`;
    this.store.set(key, content);
    return `https://fakestorage.blob.core.windows.net/${key}`;
  }

  async delete(containerName: string, blobName: string): Promise<void> {
    const key = `${containerName}/${blobName}`;
    this.store.delete(key);
  }

  getUrl(containerName: string, blobName: string): string {
    return `https://fakestorage.blob.core.windows.net/${containerName}/${blobName}`;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number }> {
    return { status: 'healthy', latencyMs: 1 };
  }

  getStore(): Map<string, Buffer> {
    return this.store;
  }
}
