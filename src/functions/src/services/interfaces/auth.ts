export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface IAuthService {
  generateToken(userId: string, email: string): string;
  verifyToken(token: string): TokenPayload | null;
}
