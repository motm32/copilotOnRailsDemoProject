import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { createUserSchema } from '@app/shared';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { ConflictError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

async function createUserHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json();
        const { email, displayName, password } = createUserSchema.parse(body);
        const { database, auth } = getServices();

        const existing = await database.getUserByEmail(email);
        if (existing) throw new ConflictError('A user with this email already exists');

        const passwordHash = await auth.hashPassword(password);
        const user = await database.createUser(email, displayName, passwordHash);
        logger.info({ userId: user.id }, 'User created');

        return {
            status: 201,
            jsonBody: {
                user: { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
            },
        };
    } catch (error) {
        return handleError(error);
    }
}

app.http('users-create', { methods: ['POST'], authLevel: 'anonymous', route: 'api/users', handler: createUserHandler });
