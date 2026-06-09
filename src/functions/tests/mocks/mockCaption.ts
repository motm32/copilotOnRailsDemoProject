import type { ICaptionService } from '../../src/services/interfaces/caption.js';

export class MockCaptionService implements ICaptionService {
  async generateCaption(_imageBuffer: Buffer, _mimeType: string): Promise<string> {
    return 'A lovely photo of us together';
  }
}
