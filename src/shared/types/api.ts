import type { User, Couple, Photo } from "./entities.js";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export type PublicUser = Omit<User, "passwordHash">;

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export interface HealthServiceStatus {
  status: "healthy" | "unhealthy";
  latencyMs?: number;
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  services: Record<string, HealthServiceStatus>;
}

export interface InviteResponse {
  inviteCode: string;
  expiresAt: string;
}

export interface CoupleResponse {
  couple: Couple;
  partner: PublicUser;
}

export interface PhotoResponse {
  photo: Photo;
}

export interface PhotoListResponse {
  photos: Photo[];
  total: number;
}

export interface SuccessResponse {
  success: boolean;
}
