export interface ICaptionService {
  generateCaption(imageBuffer: Buffer, mimeType: string): Promise<string>;
}
