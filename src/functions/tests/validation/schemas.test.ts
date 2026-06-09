import { describe, it, expect } from 'vitest';
import { loginSchema, createUserSchema, pairInviteSchema, pairAcceptSchema, uuidParamSchema, photoUploadSchema } from '@app/shared';

describe('Validation Schemas', () => {
    describe('loginSchema', () => {
        it('should pass with valid email and password', () => {
            const result = loginSchema.safeParse({ email: 'test@example.com', password: 'pass123' });
            expect(result.success).toBe(true);
        });

        it('should fail with invalid email', () => {
            const result = loginSchema.safeParse({ email: 'not-an-email', password: 'pass' });
            expect(result.success).toBe(false);
        });

        it('should fail with empty password', () => {
            const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
            expect(result.success).toBe(false);
        });
    });

    describe('createUserSchema', () => {
        it('should pass with valid data', () => {
            const result = createUserSchema.safeParse({
                email: 'new@example.com',
                displayName: 'New User',
                password: 'password123',
            });
            expect(result.success).toBe(true);
        });

        it('should fail with short password', () => {
            const result = createUserSchema.safeParse({
                email: 'new@example.com',
                displayName: 'New User',
                password: 'short',
            });
            expect(result.success).toBe(false);
        });

        it('should fail with empty display name', () => {
            const result = createUserSchema.safeParse({
                email: 'new@example.com',
                displayName: '',
                password: 'password123',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('pairInviteSchema', () => {
        it('should pass with valid email', () => {
            const result = pairInviteSchema.safeParse({ partnerEmail: 'partner@example.com' });
            expect(result.success).toBe(true);
        });

        it('should fail with invalid email', () => {
            const result = pairInviteSchema.safeParse({ partnerEmail: 'not-email' });
            expect(result.success).toBe(false);
        });
    });

    describe('pairAcceptSchema', () => {
        it('should pass with valid UUID', () => {
            const result = pairAcceptSchema.safeParse({ inviteId: '123e4567-e89b-12d3-a456-426614174000' });
            expect(result.success).toBe(true);
        });

        it('should fail with invalid UUID', () => {
            const result = pairAcceptSchema.safeParse({ inviteId: 'not-a-uuid' });
            expect(result.success).toBe(false);
        });
    });

    describe('uuidParamSchema', () => {
        it('should pass with valid UUID', () => {
            const result = uuidParamSchema.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000' });
            expect(result.success).toBe(true);
        });

        it('should fail with invalid ID', () => {
            const result = uuidParamSchema.safeParse({ id: 'abc' });
            expect(result.success).toBe(false);
        });
    });

    describe('photoUploadSchema', () => {
        it('should pass with valid JPEG file', () => {
            const result = photoUploadSchema.safeParse({ mimeType: 'image/jpeg', sizeBytes: 1024000 });
            expect(result.success).toBe(true);
        });

        it('should pass with valid PNG file', () => {
            const result = photoUploadSchema.safeParse({ mimeType: 'image/png', sizeBytes: 5000000 });
            expect(result.success).toBe(true);
        });

        it('should fail with unsupported MIME type', () => {
            const result = photoUploadSchema.safeParse({ mimeType: 'image/gif', sizeBytes: 1024 });
            expect(result.success).toBe(false);
        });

        it('should fail when file exceeds 10MB', () => {
            const result = photoUploadSchema.safeParse({ mimeType: 'image/jpeg', sizeBytes: 11 * 1024 * 1024 });
            expect(result.success).toBe(false);
        });
    });
});
