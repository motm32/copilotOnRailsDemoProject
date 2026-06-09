export interface ICaptionService {
    generateCaption(imageUrl: string): Promise<string>;
    health(): Promise<boolean>;
}
