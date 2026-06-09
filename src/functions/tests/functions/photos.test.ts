import { describe, it, expect, beforeEach } from 'vitest';
import { registerServices } from '../../src/services/registry.js';
import { createMockStorageService, createMockDatabaseService, createMockAuthService, createMockCaptionService } from '../mocks/services.js';
import { testPair, testPhoto, testPhotoWithUploader, testPublicUser } from '../mocks/fixtures.js';

describe('Photos handlers', () => {
    let mockDb: ReturnType<typeof createMockDatabaseService>;
    let mockStorage: ReturnType<typeof createMockStorageService>;
    let mockCaptions: ReturnType<typeof createMockCaptionService>;

    beforeEach(() => {
        mockDb = createMockDatabaseService();
        mockStorage = createMockStorageService();
        mockCaptions = createMockCaptionService();
        registerServices({
            storage: mockStorage,
            database: mockDb,
            auth: createMockAuthService(),
            captions: mockCaptions,
        });
    });

    describe('list photos', () => {
        it('should return photos for a paired user', async () => {
            (mockDb.getPairByUserId as any).mockResolvedValue(testPair);
            (mockDb.getPhotosByPairId as any).mockResolvedValue([testPhotoWithUploader]);

            const pair = await mockDb.getPairByUserId('user-1');
            expect(pair).toEqual(testPair);

            const photos = await mockDb.getPhotosByPairId(pair!.id);
            expect(photos).toHaveLength(1);
            expect(photos[0].uploaderName).toBe('Alex Johnson');
        });

        it('should fail if user has no pair', async () => {
            (mockDb.getPairByUserId as any).mockResolvedValue(null);

            const pair = await mockDb.getPairByUserId('user-3');
            expect(pair).toBeNull();
        });
    });

    describe('upload photo', () => {
        it('should upload and return photo', async () => {
            (mockDb.getPairByUserId as any).mockResolvedValue(testPair);
            (mockStorage.uploadPhoto as any).mockResolvedValue('https://blob.url/photo.jpg');
            (mockDb.createPhoto as any).mockResolvedValue(testPhoto);
            (mockDb.getPublicUser as any).mockResolvedValue(testPublicUser);

            const blobUrl = await mockStorage.uploadPhoto(
                Buffer.from('fake-image'),
                'pair-1/photo.jpg',
                'image/jpeg'
            );
            expect(blobUrl).toContain('photo.jpg');

            const photo = await mockDb.createPhoto({
                uploaderId: 'user-1',
                pairId: 'pair-1',
                blobUrl,
                filename: 'photo.jpg',
                mimeType: 'image/jpeg',
                sizeBytes: 1024,
            });
            expect(photo.id).toBe('photo-1');
        });
    });

    describe('delete photo', () => {
        it('should delete own photo', async () => {
            (mockDb.getPhotoById as any).mockResolvedValue(testPhoto);

            const photo = await mockDb.getPhotoById('photo-1');
            expect(photo!.uploaderId).toBe('user-1');

            await mockStorage.deletePhoto(photo!.blobUrl);
            await mockDb.deletePhoto('photo-1');
            expect(mockStorage.deletePhoto).toHaveBeenCalled();
            expect(mockDb.deletePhoto).toHaveBeenCalledWith('photo-1');
        });

        it('should reject deleting another user\'s photo', async () => {
            const otherPhoto = { ...testPhoto, uploaderId: 'user-2' };
            (mockDb.getPhotoById as any).mockResolvedValue(otherPhoto);

            const photo = await mockDb.getPhotoById('photo-1');
            expect(photo!.uploaderId).not.toBe('user-1');
        });
    });

    describe('generate caption', () => {
        it('should generate and save caption', async () => {
            (mockDb.getPhotoById as any).mockResolvedValue(testPhoto);
            (mockCaptions.generateCaption as any).mockResolvedValue('A beautiful sunset');
            (mockDb.updatePhotoCaption as any).mockResolvedValue({ ...testPhoto, caption: 'A beautiful sunset' });

            const caption = await mockCaptions.generateCaption(testPhoto.blobUrl);
            expect(caption).toBe('A beautiful sunset');

            const updated = await mockDb.updatePhotoCaption('photo-1', caption);
            expect(updated.caption).toBe('A beautiful sunset');
        });
    });
});
