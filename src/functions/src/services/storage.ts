import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import type { IStorageService } from "./interfaces/storage.js";

export class BlobStorageService implements IStorageService {
  private client: BlobServiceClient;

  constructor(connectionString: string) {
    this.client = BlobServiceClient.fromConnectionString(connectionString);
  }

  async upload(
    containerName: string,
    blobName: string,
    content: Buffer,
    contentType: string
  ): Promise<string> {
    const containerClient = this.client.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "blob" });
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(content, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    return blockBlobClient.url;
  }

  async delete(containerName: string, blobName: string): Promise<void> {
    const containerClient = this.client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  }

  getUrl(containerName: string, blobName: string): string {
    const containerClient = this.client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }

  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      // List containers as a health probe
      const iter = this.client.listContainers();
      await iter.next();
      return { status: "healthy", latencyMs: Date.now() - start };
    } catch {
      return { status: "unhealthy", latencyMs: Date.now() - start };
    }
  }
}
