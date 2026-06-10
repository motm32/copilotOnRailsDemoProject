import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError } from '../errors/index.js';

async function pairStatusHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const { database } = getServices();
        const pair = await database.getPairByUserId(authPayload.userId);

        if (!pair) {
            // No pair yet — check for pending invite
            const pendingInvite = await database.getPendingInviteForUser(authPayload.email);
            return { status: 200, jsonBody: { pair: null, partner: null, pendingInvite: pendingInvite ?? null } };
        }

        const partnerId = pair.user1Id === authPayload.userId ? pair.user2Id : pair.user1Id;
        const partner = await database.getPublicUser(partnerId);

        return { status: 200, jsonBody: { pair, partner, pendingInvite: null } };
    } catch (error) {
        return handleError(error);
    }
}

app.http('pair-status', { methods: ['GET'], authLevel: 'anonymous', route: 'api/pair/status', handler: pairStatusHandler });
