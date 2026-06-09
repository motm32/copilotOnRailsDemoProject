import type { IStorageService } from '../../src/services/interfaces/storage.js';
import type { IDatabaseService } from '../../src/services/interfaces/database.js';
import type { IAuthService, AuthPayload } from '../../src/services/interfaces/auth.js';
import type { ICaptionService } from '../../src/services/interfaces/captions.js';
import type { User, PublicUser, Pair, PairInvite, Photo, PhotoWithUploader } from '@app/shared';
import { vi } from 'vitest';

export function createMockStorageService(): IStorageService {
    return {
        uploadPhoto: vi.fn().mockResolvedValue('https://storage.blob.core.windows.net/photos/test.jpg'),
        deletePhoto: vi.fn().mockResolvedValue(undefined),
        health: vi.fn().mockResolvedValue(true),
    };
}

export function createMockDatabaseService(): IDatabaseService {
    return {
        createUser: vi.fn(),
        getUserByEmail: vi.fn().mockResolvedValue(null),
        getUserById: vi.fn().mockResolvedValue(null),
        getPublicUser: vi.fn().mockResolvedValue(null),
        createPair: vi.fn(),
        getPairByUserId: vi.fn().mockResolvedValue(null),
        createInvite: vi.fn(),
        getInviteById: vi.fn().mockResolvedValue(null),
        acceptInvite: vi.fn(),
        getPendingInviteForUser: vi.fn().mockResolvedValue(null),
        createPhoto: vi.fn(),
        getPhotosByPairId: vi.fn().mockResolvedValue([]),
        getPhotoById: vi.fn().mockResolvedValue(null),
        deletePhoto: vi.fn().mockResolvedValue(undefined),
        updatePhotoCaption: vi.fn(),
        transaction: vi.fn().mockImplementation(async (fn) => fn({})),
        health: vi.fn().mockResolvedValue(true),
    };
}

export function createMockAuthService(): IAuthService {
    return {
        generateToken: vi.fn().mockReturnValue('mock-token'),
        verifyToken: vi.fn().mockReturnValue({ userId: 'user-1', email: 'test@example.com' } as AuthPayload),
        hashPassword: vi.fn().mockResolvedValue('hashed-password'),
        verifyPassword: vi.fn().mockResolvedValue(true),
    };
}

export function createMockCaptionService(): ICaptionService {
    return {
        generateCaption: vi.fn().mockResolvedValue('A beautiful moment captured together.'),
        health: vi.fn().mockResolvedValue(true),
    };
}
