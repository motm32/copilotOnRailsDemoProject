export interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
}

export interface Pair {
    id: string;
    user1Id: string;
    user2Id: string;
    createdAt: string;
}

export interface Photo {
    id: string;
    uploaderId: string;
    uploaderName: string;
    pairId: string;
    blobUrl: string;
    caption: string | null;
    createdAt: string;
}

export interface PairInvite {
    id: string;
    fromUserId: string;
    toEmail: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

// API response types
export interface LoginResponse {
    token: string;
    user: User;
}

export interface MeResponse {
    user: User;
}

export interface CreateUserResponse {
    user: User;
}

export interface PairInviteResponse {
    invite: PairInvite;
}

export interface PairAcceptResponse {
    pair: Pair;
}

export interface PairStatusResponse {
    pair: Pair | null;
    partner: User | null;
}

export interface PhotoUploadResponse {
    photo: Photo;
}

export interface PhotoListResponse {
    photos: Photo[];
}

export interface PhotoDeleteResponse {
    success: boolean;
}

export interface CaptionGenerateResponse {
    caption: string;
}

export interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, { status: 'up' | 'down'; latencyMs?: number }>;
}

export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
