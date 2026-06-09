export interface IStorageService {
    uploadPhoto(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
    deletePhoto(blobUrl: string): Promise<void>;
    health(): Promise<boolean>;
}
