import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthService } from '../../src/services/auth.js';
import type { AppConfig } from '../../src/services/config.js';

const mockConfig: AppConfig = {
    storageConnectionString: 'test',
    databaseUrl: 'test',
    azureOpenAiEndpoint: '',
    azureOpenAiApiKey: '',
    authSecret: 'test-secret-key',
};

describe('MockAuthService', () => {
    let auth: MockAuthService;

    beforeEach(() => {
        auth = new MockAuthService(mockConfig);
    });

    describe('generateToken / verifyToken', () => {
        it('should generate and verify a valid token', () => {
            const payload = { userId: 'user-1', email: 'test@example.com' };
            const token = auth.generateToken(payload);
            const result = auth.verifyToken(token);
            expect(result).toEqual(payload);
        });

        it('should return null for invalid token', () => {
            expect(auth.verifyToken('invalid-token')).toBeNull();
        });

        it('should return null for tampered token', () => {
            const payload = { userId: 'user-1', email: 'test@example.com' };
            const token = auth.generateToken(payload);
            const tampered = token.slice(0, -1) + 'x';
            expect(auth.verifyToken(tampered)).toBeNull();
        });

        it('should return null for token with wrong format', () => {
            expect(auth.verifyToken('')).toBeNull();
            expect(auth.verifyToken('a.b.c')).toBeNull();
        });
    });

    describe('hashPassword / verifyPassword', () => {
        it('should hash and verify a password', async () => {
            const hash = await auth.hashPassword('my-password');
            expect(hash).not.toBe('my-password');
            const valid = await auth.verifyPassword('my-password', hash);
            expect(valid).toBe(true);
        });

        it('should reject wrong password', async () => {
            const hash = await auth.hashPassword('correct');
            const valid = await auth.verifyPassword('wrong', hash);
            expect(valid).toBe(false);
        });
    });
});
