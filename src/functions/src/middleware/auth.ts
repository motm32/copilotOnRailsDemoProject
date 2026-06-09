import type { HttpRequest } from '@azure/functions';
import type { AuthPayload } from '../services/interfaces/auth.js';
import { getServices } from '../services/registry.js';

export function extractToken(request: HttpRequest): string | null {
    const header = request.headers.get('authorization');
    if (!header || !header.startsWith('Bearer ')) return null;
    return header.slice(7);
}

export function authenticateRequest(request: HttpRequest): AuthPayload | null {
    const token = extractToken(request);
    if (!token) return null;
    const { auth } = getServices();
    return auth.verifyToken(token);
}
