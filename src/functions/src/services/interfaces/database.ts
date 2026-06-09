import type { User, Couple, Photo, InviteCode } from "../../../../shared/types/entities.js";

export interface IDatabaseService {
  // Users
  createUser(user: Omit<User, "createdAt" | "updatedAt">): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<Pick<User, "coupleId" | "displayName">>): Promise<User>;

  // Couples
  createCouple(couple: Omit<Couple, "createdAt">): Promise<Couple>;
  getCoupleById(id: string): Promise<Couple | null>;
  getCoupleByUserId(userId: string): Promise<Couple | null>;

  // Invite Codes
  createInviteCode(invite: Omit<InviteCode, "createdAt">): Promise<InviteCode>;
  getInviteCodeByCode(code: string): Promise<InviteCode | null>;
  markInviteCodeUsed(id: string, usedBy: string): Promise<void>;
  getActiveInviteByUser(userId: string): Promise<InviteCode | null>;

  // Photos
  createPhoto(photo: Omit<Photo, "createdAt">): Promise<Photo>;
  getPhotoById(id: string): Promise<Photo | null>;
  getPhotosByCoupleId(coupleId: string): Promise<Photo[]>;
  deletePhoto(id: string): Promise<void>;

  // Transaction support
  transaction<T>(fn: (client: IDatabaseService) => Promise<T>): Promise<T>;

  // Health
  healthCheck(): Promise<{ status: "healthy" | "unhealthy"; latencyMs: number }>;
}
