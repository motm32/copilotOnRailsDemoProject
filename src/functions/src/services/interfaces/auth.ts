export interface AuthPayload {
    userId: string;
    email: string;
}

export interface IAuthService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload | null;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
}
