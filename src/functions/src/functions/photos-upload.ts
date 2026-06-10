import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { photoUploadSchema } from '@app/shared';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest } from '../middleware/auth.js';
import { getServices } from '../services/registry.js';
import { handleError } from '../middleware/error-handler.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

async function photosUploadHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authPayload = authenticateRequest(request);
        if (!authPayload) throw new UnauthorizedError();

        const { database, storage, captions } = getServices();

        const pair = await database.getPairByUserId(authPayload.userId);
        if (!pair) throw new NotFoundError('You must be paired to upload photos');

        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || !(file instanceof Blob)) throw new ValidationError('No file provided');

        const mimeType = file.type;
        const sizeBytes = file.size;
        photoUploadSchema.parse({ mimeType, sizeBytes });

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
        const filename = `${pair.id}/${uuidv4()}.${ext}`;

        const blobUrl = await storage.uploadPhoto(buffer, filename, mimeType);

        const photo = await database.createPhoto({
            uploaderId: authPayload.userId,
            pairId: pair.id,
            blobUrl,
            filename,
            mimeType,
            sizeBytes,
        });

        // Auto-generate a caption
        const caption = await captions.generateCaption(blobUrl);
        const updatedPhoto = await database.updatePhotoCaption(photo.id, caption);

        const user = await database.getPublicUser(authPayload.userId);
        logger.info({ photoId: photo.id, pairId: pair.id }, 'Photo uploaded');

        return {
            status: 201,
            jsonBody: { photo: { ...updatedPhoto, uploaderName: user?.displayName || 'Unknown' } },
        };
    } catch (error) {
        return handleError(error);
    }
}

app.http('photos-upload', { methods: ['POST'], authLevel: 'anonymous', route: 'api/photos/upload', handler: photosUploadHandler });
