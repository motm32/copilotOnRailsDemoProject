import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { pairInviteSchema } from '@app/shared';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError, ConflictError, NotFoundError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

async function pairInviteHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const body = await request.json();
        const { partnerEmail } = pairInviteSchema.parse(body);
        const { database } = getServices();

        // Check if user is already paired
        const existingPair = await database.getPairByUserId(authPayload.userId);
        if (existingPair) throw new ConflictError('You are already paired with someone');

        // Check partner exists
        const partner = await database.getUserByEmail(partnerEmail);
        if (!partner) throw new NotFoundError('No user found with that email');

        if (partner.id === authPayload.userId) throw new ConflictError('You cannot pair with yourself');

        const invite = await database.createInvite(authPayload.userId, partnerEmail);
        logger.info({ inviteId: invite.id, from: authPayload.userId }, 'Pair invite sent');

        return { status: 201, jsonBody: { invite } };
    } catch (error) {
        return handleError(error);
    }
}

app.http('pair-invite', { methods: ['POST'], authLevel: 'anonymous', route: 'api/pair/invite', handler: pairInviteHandler });
