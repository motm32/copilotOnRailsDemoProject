import { z } from 'zod';

// Auth
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export type LoginRequest = z.infer<typeof loginSchema>;

// Users
export const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    displayName: z.string().min(1, 'Display name is required').max(100),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type CreateUserRequest = z.infer<typeof createUserSchema>;

// Pair
export const pairInviteSchema = z.object({
    partnerEmail: z.string().email('Invalid email address'),
});
export type PairInviteRequest = z.infer<typeof pairInviteSchema>;

export const pairAcceptSchema = z.object({
    inviteId: z.string().uuid('Invalid invite ID'),
});
export type PairAcceptRequest = z.infer<typeof pairAcceptSchema>;

// Path params
export const uuidParamSchema = z.object({
    id: z.string().uuid('Invalid ID format'),
});
export type UuidParam = z.infer<typeof uuidParamSchema>;

// File upload validation
export const photoUploadSchema = z.object({
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
        errorMap: () => ({ message: 'Only JPG, PNG, and WebP images are allowed' }),
    }),
    sizeBytes: z.number().max(10 * 1024 * 1024, 'File must be under 10MB'),
});
export type PhotoUploadValidation = z.infer<typeof photoUploadSchema>;
