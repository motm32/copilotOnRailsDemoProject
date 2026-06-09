import type {
    LoginResponse,
    MeResponse,
    CreateUserResponse,
    PairInviteResponse,
    PairAcceptResponse,
    PairStatusResponse,
    PhotoUploadResponse,
    PhotoListResponse,
    PhotoDeleteResponse,
    CaptionGenerateResponse,
    HealthResponse,
    ErrorResponse,
} from '@/types';

const BASE_URL = '/api';

class ApiError extends Error {
    constructor(
        public status: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!response.ok) {
        const body = (await response.json()) as ErrorResponse;
        throw new ApiError(response.status, body.error.code, body.error.message, body.error.details);
    }

    return response.json() as Promise<T>;
}

export const api = {
    // Auth
    login: (email: string, password: string) =>
        request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    me: () => request<MeResponse>('/auth/me'),

    // Users
    createUser: (email: string, displayName: string, password: string) =>
        request<CreateUserResponse>('/users', {
            method: 'POST',
            body: JSON.stringify({ email, displayName, password }),
        }),

    // Pair
    sendInvite: (partnerEmail: string) =>
        request<PairInviteResponse>('/pair/invite', {
            method: 'POST',
            body: JSON.stringify({ partnerEmail }),
        }),
    acceptInvite: (inviteId: string) =>
        request<PairAcceptResponse>('/pair/accept', {
            method: 'POST',
            body: JSON.stringify({ inviteId }),
        }),
    getPairStatus: () => request<PairStatusResponse>('/pair/status'),

    // Photos
    uploadPhoto: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return request<PhotoUploadResponse>('/photos/upload', {
            method: 'POST',
            body: formData,
        });
    },
    listPhotos: () => request<PhotoListResponse>('/photos'),
    deletePhoto: (id: string) =>
        request<PhotoDeleteResponse>(`/photos/${id}`, { method: 'DELETE' }),
    generateCaption: (photoId: string) =>
        request<CaptionGenerateResponse>(`/photos/${photoId}/caption`, { method: 'POST' }),

    // Health
    health: () => request<HealthResponse>('/health'),
};

export { ApiError };
