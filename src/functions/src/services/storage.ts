import { BlobServiceClient } from '@azure/storage-blob';
import type { IStorageService } from './interfaces/storage.js';
import type { AppConfig } from './config.js';

export class BlobStorageService implements IStorageService {
    private client: BlobServiceClient;
    private containerName = 'photos';

    constructor(config: AppConfig) {
        this.client = BlobServiceClient.fromConnectionString(config.storageConnectionString);
    }

    async uploadPhoto(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
        const containerClient = this.client.getContainerClient(this.containerName);
        await containerClient.createIfNotExists({ access: 'blob' });
        const blobClient = containerClient.getBlockBlobClient(filename);
        await blobClient.upload(buffer, buffer.length, {
            blobHTTPHeaders: { blobContentType: mimeType },
        });
        return blobClient.url;
    }

    async deletePhoto(blobUrl: string): Promise<void> {
        const url = new URL(blobUrl);
        const blobName = url.pathname.split('/').slice(2).join('/');
        const containerClient = this.client.getContainerClient(this.containerName);
        await containerClient.deleteBlob(blobName);
    }

    async health(): Promise<boolean> {
        try {
            const iter = this.client.listContainers();
            await iter.next();
            return true;
        } catch {
            return false;
        }
    }
}
