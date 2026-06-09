export interface User {
    id: string;
    email: string;
    displayName: string;
    passwordHash: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PublicUser {
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

export interface PairInvite {
    id: string;
    fromUserId: string;
    toEmail: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

export interface Photo {
    id: string;
    uploaderId: string;
    pairId: string;
    blobUrl: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    caption: string | null;
    createdAt: string;
}

export interface PhotoWithUploader extends Photo {
    uploaderName: string;
}
