import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError, NotFoundError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

async function captionsGenerateHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const photoId = request.params.id;
        if (!photoId) throw new NotFoundError('Photo ID required');

        const { database, captions } = getServices();
        const photo = await database.getPhotoById(photoId);
        if (!photo) throw new NotFoundError('Photo not found');

        const caption = await captions.generateCaption(photo.blobUrl);
        const updated = await database.updatePhotoCaption(photoId, caption);
        logger.info({ photoId, captionLength: caption.length }, 'Caption generated');

        return { status: 200, jsonBody: { caption: updated.caption! } };
    } catch (error) {
        return handleError(error);
    }
}

app.http('captions-generate', { methods: ['POST'], authLevel: 'anonymous', route: 'api/photos/{id}/caption', handler: captionsGenerateHandler });
