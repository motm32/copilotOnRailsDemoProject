export interface IStorageService {
  upload(
    containerName: string,
    blobName: string,
    content: Buffer,
    contentType: string
  ): Promise<string>;

  delete(containerName: string, blobName: string): Promise<void>;

  getUrl(containerName: string, blobName: string): string;

  healthCheck(): Promise<{ status: "healthy" | "unhealthy"; latencyMs: number }>;
}
