import type { IDatabaseService } from '../../src/services/interfaces/database.js';
import type { User, Couple, Photo, InviteCode } from '../../../shared/types/entities.js';

export class MockDatabaseService implements IDatabaseService {
  users: User[] = [];
  couples: Couple[] = [];
  photos: Photo[] = [];
  inviteCodes: InviteCode[] = [];

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const newUser: User = { ...user, createdAt: now, updatedAt: now };
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async updateUser(id: string, updates: Partial<Pick<User, 'coupleId' | 'displayName'>>): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates, { updatedAt: new Date() });
    return user;
  }

  async createCouple(couple: Omit<Couple, 'createdAt'>): Promise<Couple> {
    const newCouple: Couple = { ...couple, createdAt: new Date() };
    this.couples.push(newCouple);
    return newCouple;
  }

  async getCoupleById(id: string): Promise<Couple | null> {
    return this.couples.find((c) => c.id === id) ?? null;
  }

  async getCoupleByUserId(userId: string): Promise<Couple | null> {
    return this.couples.find((c) => c.user1Id === userId || c.user2Id === userId) ?? null;
  }

  async createInviteCode(invite: Omit<InviteCode, 'createdAt'>): Promise<InviteCode> {
    const newInvite: InviteCode = { ...invite, createdAt: new Date() };
    this.inviteCodes.push(newInvite);
    return newInvite;
  }

  async getInviteCodeByCode(code: string): Promise<InviteCode | null> {
    return this.inviteCodes.find((i) => i.code === code) ?? null;
  }

  async markInviteCodeUsed(id: string, usedBy: string): Promise<void> {
    const invite = this.inviteCodes.find((i) => i.id === id);
    if (invite) invite.usedBy = usedBy;
  }

  async getActiveInviteByUser(userId: string): Promise<InviteCode | null> {
    return (
      this.inviteCodes.find(
        (i) => i.createdBy === userId && !i.usedBy && i.expiresAt > new Date()
      ) ?? null
    );
  }

  async createPhoto(photo: Omit<Photo, 'createdAt'>): Promise<Photo> {
    const newPhoto: Photo = { ...photo, createdAt: new Date() };
    this.photos.push(newPhoto);
    return newPhoto;
  }

  async getPhotoById(id: string): Promise<Photo | null> {
    return this.photos.find((p) => p.id === id) ?? null;
  }

  async getPhotosByCoupleId(coupleId: string): Promise<Photo[]> {
    return this.photos.filter((p) => p.coupleId === coupleId);
  }

  async deletePhoto(id: string): Promise<void> {
    this.photos = this.photos.filter((p) => p.id !== id);
  }

  async transaction<T>(fn: (client: IDatabaseService) => Promise<T>): Promise<T> {
    return fn(this);
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number }> {
    return { status: 'healthy', latencyMs: 1 };
  }
}
