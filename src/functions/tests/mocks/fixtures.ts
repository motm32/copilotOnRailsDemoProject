import type { User, PublicUser, Pair, PairInvite, Photo, PhotoWithUploader } from '@app/shared';

export const testUser: User = {
    id: 'user-1',
    email: 'alex@example.com',
    displayName: 'Alex Johnson',
    passwordHash: 'hashed-password',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

export const testPartner: User = {
    id: 'user-2',
    email: 'jordan@example.com',
    displayName: 'Jordan Smith',
    passwordHash: 'hashed-password',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

export const testPublicUser: PublicUser = {
    id: 'user-1',
    email: 'alex@example.com',
    displayName: 'Alex Johnson',
    avatarUrl: null,
};

export const testPair: Pair = {
    id: 'pair-1',
    user1Id: 'user-1',
    user2Id: 'user-2',
    createdAt: '2026-03-14T00:00:00Z',
};

export const testInvite: PairInvite = {
    id: 'invite-1',
    fromUserId: 'user-1',
    toEmail: 'jordan@example.com',
    status: 'pending',
    createdAt: '2026-06-01T00:00:00Z',
};

export const testPhoto: Photo = {
    id: 'photo-1',
    uploaderId: 'user-1',
    pairId: 'pair-1',
    blobUrl: 'https://storage.blob.core.windows.net/photos/test.jpg',
    filename: 'test.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024000,
    caption: 'A sunset at the lake.',
    createdAt: '2026-06-08T18:00:00Z',
};

export const testPhotoWithUploader: PhotoWithUploader = {
    ...testPhoto,
    uploaderName: 'Alex Johnson',
};
