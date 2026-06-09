import { createHmac } from 'node:crypto';
import type { IAuthService, AuthPayload } from './interfaces/auth.js';
import type { AppConfig } from './config.js';

export class MockAuthService implements IAuthService {
    private secret: string;

    constructor(config: AppConfig) {
        this.secret = config.authSecret;
    }

    generateToken(payload: AuthPayload): string {
        const data = JSON.stringify(payload);
        const encoded = Buffer.from(data).toString('base64url');
        const sig = this.sign(encoded);
        return `${encoded}.${sig}`;
    }

    verifyToken(token: string): AuthPayload | null {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const [encoded, sig] = parts;
        if (this.sign(encoded) !== sig) return null;
        try {
            const data = Buffer.from(encoded, 'base64url').toString();
            return JSON.parse(data) as AuthPayload;
        } catch {
            return null;
        }
    }

    async hashPassword(password: string): Promise<string> {
        return createHmac('sha256', this.secret).update(password).digest('hex');
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        const computed = await this.hashPassword(password);
        return computed === hash;
    }

    private sign(data: string): string {
        return createHmac('sha256', this.secret).update(data).digest('base64url');
    }
}
