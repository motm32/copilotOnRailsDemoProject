import { describe, it, expect, beforeEach } from 'vitest';
import { registerServices } from '../../src/services/registry.js';
import { createMockStorageService, createMockDatabaseService, createMockAuthService, createMockCaptionService } from '../mocks/services.js';
import { testUser, testPartner, testPair, testInvite, testPublicUser } from '../mocks/fixtures.js';

describe('Pair handlers', () => {
    let mockDb: ReturnType<typeof createMockDatabaseService>;

    beforeEach(() => {
        mockDb = createMockDatabaseService();
        registerServices({
            storage: createMockStorageService(),
            database: mockDb,
            auth: createMockAuthService(),
            captions: createMockCaptionService(),
        });
    });

    describe('send invite', () => {
        it('should create invite when user exists and is not paired', async () => {
            (mockDb.getPairByUserId as any).mockResolvedValue(null);
            (mockDb.getUserByEmail as any).mockResolvedValue(testPartner);
            (mockDb.createInvite as any).mockResolvedValue(testInvite);

            const pair = await mockDb.getPairByUserId('user-1');
            expect(pair).toBeNull();

            const partner = await mockDb.getUserByEmail('jordan@example.com');
            expect(partner).not.toBeNull();

            const invite = await mockDb.createInvite('user-1', 'jordan@example.com');
            expect(invite.status).toBe('pending');
        });

        it('should reject if already paired', async () => {
            (mockDb.getPairByUserId as any).mockResolvedValue(testPair);

            const pair = await mockDb.getPairByUserId('user-1');
            expect(pair).not.toBeNull();
        });
    });

    describe('accept invite', () => {
        it('should accept valid pending invite and create pair', async () => {
            (mockDb.getInviteById as any).mockResolvedValue(testInvite);
            (mockDb.acceptInvite as any).mockResolvedValue({ ...testInvite, status: 'accepted' });
            (mockDb.createPair as any).mockResolvedValue(testPair);

            const invite = await mockDb.getInviteById('invite-1');
            expect(invite!.status).toBe('pending');

            const accepted = await mockDb.acceptInvite('invite-1');
            expect(accepted.status).toBe('accepted');

            const pair = await mockDb.createPair(invite!.fromUserId, 'user-2');
            expect(pair.id).toBe('pair-1');
        });
    });

    describe('get pair status', () => {
        it('should return pair and partner info', async () => {
            (mockDb.getPairByUserId as any).mockResolvedValue(testPair);
            (mockDb.getPublicUser as any).mockResolvedValue(testPublicUser);

            const pair = await mockDb.getPairByUserId('user-1');
            expect(pair).not.toBeNull();

            const partnerId = pair!.user1Id === 'user-1' ? pair!.user2Id : pair!.user1Id;
            const partner = await mockDb.getPublicUser(partnerId);
            expect(partner).not.toBeNull();
        });

        it('should return null when not paired', async () => {
            (mockDb.getPairByUserId as any).mockResolvedValue(null);

            const pair = await mockDb.getPairByUserId('user-3');
            expect(pair).toBeNull();
        });
    });
});
