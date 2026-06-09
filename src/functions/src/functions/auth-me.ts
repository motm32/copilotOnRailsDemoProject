import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError, NotFoundError } from '../errors/index.js';

async function meHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const { database } = getServices();
        const user = await database.getPublicUser(authPayload.userId);
        if (!user) throw new NotFoundError('User not found');

        return { status: 200, jsonBody: { user } };
    } catch (error) {
        return handleError(error);
    }
}

app.http('auth-me', { methods: ['GET'], authLevel: 'anonymous', route: 'api/auth/me', handler: meHandler });
