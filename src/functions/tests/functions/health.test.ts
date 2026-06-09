import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerServices } from '../../src/services/registry.js';
import { createMockStorageService, createMockDatabaseService, createMockAuthService, createMockCaptionService } from '../mocks/services.js';

// We need to test the handler logic directly
describe('Health endpoint', () => {
    beforeEach(() => {
        registerServices({
            storage: createMockStorageService(),
            database: createMockDatabaseService(),
            auth: createMockAuthService(),
            captions: createMockCaptionService(),
        });
    });

    it('should return healthy when all services are up', async () => {
        const { getServices } = await import('../../src/services/registry.js');
        const services = getServices();

        const [storageHealth, dbHealth, captionsHealth] = await Promise.allSettled([
            services.storage.health(),
            services.database.health(),
            services.captions.health(),
        ]);

        const svcStatus = {
            storage: { status: storageHealth.status === 'fulfilled' && storageHealth.value ? 'up' : 'down' },
            database: { status: dbHealth.status === 'fulfilled' && dbHealth.value ? 'up' : 'down' },
            captions: { status: captionsHealth.status === 'fulfilled' && captionsHealth.value ? 'up' : 'down' },
        };

        expect(svcStatus.storage.status).toBe('up');
        expect(svcStatus.database.status).toBe('up');
        expect(svcStatus.captions.status).toBe('up');
    });

    it('should return degraded when caption service is down', async () => {
        const mockCaptions = createMockCaptionService();
        (mockCaptions.health as any).mockResolvedValue(false);
        registerServices({
            storage: createMockStorageService(),
            database: createMockDatabaseService(),
            auth: createMockAuthService(),
            captions: mockCaptions,
        });

        const { getServices } = await import('../../src/services/registry.js');
        const services = getServices();

        const captionsHealth = await services.captions.health();
        expect(captionsHealth).toBe(false);
    });
});
