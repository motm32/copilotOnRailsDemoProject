import type { User, PublicUser, Pair, PairInvite, Photo, PhotoWithUploader } from '@app/shared';

export interface IDatabaseService {
    // Users
    createUser(email: string, displayName: string, passwordHash: string): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    getPublicUser(id: string): Promise<PublicUser | null>;

    // Pairs
    createPair(user1Id: string, user2Id: string): Promise<Pair>;
    getPairByUserId(userId: string): Promise<Pair | null>;

    // Invites
    createInvite(fromUserId: string, toEmail: string): Promise<PairInvite>;
    getInviteById(id: string): Promise<PairInvite | null>;
    acceptInvite(inviteId: string): Promise<PairInvite>;
    getPendingInviteForUser(email: string): Promise<PairInvite | null>;

    // Photos
    createPhoto(photo: Omit<Photo, 'id' | 'createdAt' | 'caption'>): Promise<Photo>;
    getPhotosByPairId(pairId: string): Promise<PhotoWithUploader[]>;
    getPhotoById(id: string): Promise<Photo | null>;
    deletePhoto(id: string): Promise<void>;
    updatePhotoCaption(id: string, caption: string): Promise<Photo>;

    // Transactions
    transaction<T>(fn: (client: unknown) => Promise<T>): Promise<T>;

    // Health
    health(): Promise<boolean>;
}
