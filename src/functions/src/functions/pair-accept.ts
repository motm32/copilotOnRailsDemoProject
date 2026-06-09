import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { pairAcceptSchema } from '@app/shared';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError, NotFoundError, ConflictError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

async function pairAcceptHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const body = await request.json();
        const { inviteId } = pairAcceptSchema.parse(body);
        const { database } = getServices();

        const invite = await database.getInviteById(inviteId);
        if (!invite) throw new NotFoundError('Invite not found');
        if (invite.toEmail !== authPayload.email) throw new ConflictError('This invite is not for you');
        if (invite.status !== 'pending') throw new ConflictError('Invite is no longer pending');

        // Accept invite and create pair in a transaction
        const pair = await database.transaction(async () => {
            await database.acceptInvite(inviteId);
            return database.createPair(invite.fromUserId, authPayload.userId);
        });

        logger.info({ pairId: pair.id }, 'Pair created');
        return { status: 200, jsonBody: { pair } };
    } catch (error) {
        return handleError(error);
    }
}

app.http('pair-accept', { methods: ['POST'], authLevel: 'anonymous', route: 'api/pair/accept', handler: pairAcceptHandler });
