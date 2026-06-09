import type { PublicUser, Pair, PairInvite, PhotoWithUploader } from './entities.js';

// Error response shape
export type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'BAD_REQUEST'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'INTERNAL_ERROR'
    | 'SERVICE_UNAVAILABLE';

export interface ErrorResponse {
    error: {
        code: ErrorCode;
        message: string;
        details?: unknown;
    };
}

// Auth
export interface LoginResponse {
    token: string;
    user: PublicUser;
}

export interface MeResponse {
    user: PublicUser;
}

// Users
export interface CreateUserResponse {
    user: PublicUser;
}

// Pair
export interface PairInviteResponse {
    invite: PairInvite;
}

export interface PairAcceptResponse {
    pair: Pair;
}

export interface PairStatusResponse {
    pair: Pair | null;
    partner: PublicUser | null;
}

// Photos
export interface PhotoUploadResponse {
    photo: PhotoWithUploader;
}

export interface PhotoListResponse {
    photos: PhotoWithUploader[];
}

export interface PhotoDeleteResponse {
    success: boolean;
}

// Captions
export interface CaptionGenerateResponse {
    caption: string;
}

// Health
export interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, { status: 'up' | 'down'; latencyMs?: number }>;
}
