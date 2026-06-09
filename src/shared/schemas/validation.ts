import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  displayName: z.string().min(1, "Display name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const joinCoupleSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JoinCoupleInput = z.infer<typeof joinCoupleSchema>;
