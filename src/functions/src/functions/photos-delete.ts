import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

async function photosDeleteHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const photoId = request.params.id;
        if (!photoId) throw new NotFoundError('Photo ID required');

        const { database, storage } = getServices();
        const photo = await database.getPhotoById(photoId);
        if (!photo) throw new NotFoundError('Photo not found');

        if (photo.uploaderId !== authPayload.userId) {
            throw new ForbiddenError('You can only delete your own photos');
        }

        await storage.deletePhoto(photo.blobUrl);
        await database.deletePhoto(photoId);
        logger.info({ photoId }, 'Photo deleted');

        return { status: 200, jsonBody: { success: true } };
    } catch (error) {
        return handleError(error);
    }
}

app.http('photos-delete', { methods: ['DELETE'], authLevel: 'anonymous', route: 'api/photos/{id}', handler: photosDeleteHandler });
