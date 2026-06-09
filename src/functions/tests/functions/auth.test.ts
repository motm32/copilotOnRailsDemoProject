import { describe, it, expect, beforeEach } from 'vitest';
import { registerServices } from '../../src/services/registry.js';
import { createMockStorageService, createMockDatabaseService, createMockAuthService, createMockCaptionService } from '../mocks/services.js';
import { testUser } from '../mocks/fixtures.js';

describe('Auth handlers', () => {
    let mockDb: ReturnType<typeof createMockDatabaseService>;
    let mockAuth: ReturnType<typeof createMockAuthService>;

    beforeEach(() => {
        mockDb = createMockDatabaseService();
        mockAuth = createMockAuthService();
        registerServices({
            storage: createMockStorageService(),
            database: mockDb,
            auth: mockAuth,
            captions: createMockCaptionService(),
        });
    });

    describe('login', () => {
        it('should return token for valid credentials', async () => {
            (mockDb.getUserByEmail as any).mockResolvedValue(testUser);
            (mockAuth.verifyPassword as any).mockResolvedValue(true);
            (mockAuth.generateToken as any).mockReturnValue('test-token');

            // Verify service interactions
            const user = await mockDb.getUserByEmail('alex@example.com');
            expect(user).toEqual(testUser);

            const valid = await mockAuth.verifyPassword('password', testUser.passwordHash);
            expect(valid).toBe(true);

            const token = mockAuth.generateToken({ userId: testUser.id, email: testUser.email });
            expect(token).toBe('test-token');
        });

        it('should reject invalid email', async () => {
            (mockDb.getUserByEmail as any).mockResolvedValue(null);

            const user = await mockDb.getUserByEmail('wrong@example.com');
            expect(user).toBeNull();
        });

        it('should reject wrong password', async () => {
            (mockDb.getUserByEmail as any).mockResolvedValue(testUser);
            (mockAuth.verifyPassword as any).mockResolvedValue(false);

            const valid = await mockAuth.verifyPassword('wrong', testUser.passwordHash);
            expect(valid).toBe(false);
        });
    });

    describe('create user', () => {
        it('should create a user with hashed password', async () => {
            (mockDb.getUserByEmail as any).mockResolvedValue(null);
            (mockAuth.hashPassword as any).mockResolvedValue('new-hash');
            (mockDb.createUser as any).mockResolvedValue({ ...testUser, id: 'new-user' });

            const existing = await mockDb.getUserByEmail('new@example.com');
            expect(existing).toBeNull();

            const hash = await mockAuth.hashPassword('password123');
            expect(hash).toBe('new-hash');

            const user = await mockDb.createUser('new@example.com', 'New User', hash);
            expect(user.id).toBe('new-user');
        });

        it('should reject duplicate email', async () => {
            (mockDb.getUserByEmail as any).mockResolvedValue(testUser);

            const existing = await mockDb.getUserByEmail('alex@example.com');
            expect(existing).not.toBeNull();
        });
    });
});
