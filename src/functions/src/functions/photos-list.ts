import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError, NotFoundError } from '../errors/index.js';

async function photosListHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const { database } = getServices();
        const pair = await database.getPairByUserId(authPayload.userId);
        if (!pair) throw new NotFoundError('You must be paired to view photos');

        const photos = await database.getPhotosByPairId(pair.id);
        return { status: 200, jsonBody: { photos } };
    } catch (error) {
        return handleError(error);
    }
}

app.http('photos-list', { methods: ['GET'], authLevel: 'anonymous', route: 'api/photos', handler: photosListHandler });
