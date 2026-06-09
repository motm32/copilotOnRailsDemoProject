import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { loginSchema } from '@app/shared';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

async function loginHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json();
        const { email, password } = loginSchema.parse(body);
        const { database, auth } = getServices();

        const user = await database.getUserByEmail(email);
        if (!user) throw new UnauthorizedError('Invalid credentials');

        const valid = await auth.verifyPassword(password, user.passwordHash);
        if (!valid) throw new UnauthorizedError('Invalid credentials');

        const token = auth.generateToken({ userId: user.id, email: user.email });
        logger.info({ userId: user.id }, 'User logged in');

        return {
            status: 200,
            jsonBody: {
                token,
                user: { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
            },
        };
    } catch (error) {
        return handleError(error);
    }
}

app.http('auth-login', { methods: ['POST'], authLevel: 'anonymous', route: 'api/auth/login', handler: loginHandler });
