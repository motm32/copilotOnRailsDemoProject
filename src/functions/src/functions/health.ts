import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { getServices } from '../services/registry.js';

async function healthHandler(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
    const { storage, database, captions } = getServices();

    const [storageHealth, dbHealth, captionsHealth] = await Promise.allSettled([
        storage.health(),
        database.health(),
        captions.health(),
    ]);

    const services = {
        storage: { status: storageHealth.status === 'fulfilled' && storageHealth.value ? 'up' : 'down' as const },
        database: { status: dbHealth.status === 'fulfilled' && dbHealth.value ? 'up' : 'down' as const },
        captions: { status: captionsHealth.status === 'fulfilled' && captionsHealth.value ? 'up' : 'down' as const },
    };

    const essentialDown = services.storage.status === 'down' && services.database.status === 'down';
    const allUp = Object.values(services).every((s) => s.status === 'up');
    const status = essentialDown ? 'unhealthy' : allUp ? 'healthy' : 'degraded';

    return {
        status: status === 'unhealthy' ? 503 : 200,
        jsonBody: { status, services },
    };
}

app.http('health', { methods: ['GET'], authLevel: 'anonymous', route: 'api/health', handler: healthHandler });
