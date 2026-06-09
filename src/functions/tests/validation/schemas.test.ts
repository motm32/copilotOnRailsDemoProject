import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, joinCoupleSchema } from '../../../shared/schemas/validation.js';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = registerSchema.safeParse({
        displayName: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        displayName: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing displayName', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'bad',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('joinCoupleSchema', () => {
    it('should accept valid invite code', () => {
      const result = joinCoupleSchema.safeParse({
        inviteCode: 'ABCD1234',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing inviteCode', () => {
      const result = joinCoupleSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty inviteCode', () => {
      const result = joinCoupleSchema.safeParse({
        inviteCode: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
