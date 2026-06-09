import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAICaptionService } from '../../src/services/captions.js';
import type { AppConfig } from '../../src/services/config.js';

describe('OpenAICaptionService', () => {
    describe('when not configured', () => {
        let service: OpenAICaptionService;

        beforeEach(() => {
            const config: AppConfig = {
                storageConnectionString: 'test',
                databaseUrl: 'test',
                azureOpenAiEndpoint: '',
                azureOpenAiApiKey: '',
                authSecret: 'secret',
            };
            service = new OpenAICaptionService(config);
        });

        it('should return fallback caption', async () => {
            const caption = await service.generateCaption('https://example.com/photo.jpg');
            expect(caption).toBeTruthy();
            expect(typeof caption).toBe('string');
            expect(caption.length).toBeGreaterThan(0);
        });

        it('should report unhealthy', async () => {
            expect(await service.health()).toBe(false);
        });
    });

    describe('when configured but API fails', () => {
        let service: OpenAICaptionService;

        beforeEach(() => {
            const config: AppConfig = {
                storageConnectionString: 'test',
                databaseUrl: 'test',
                azureOpenAiEndpoint: 'https://myai.openai.azure.com',
                azureOpenAiApiKey: 'test-key',
                authSecret: 'secret',
            };
            service = new OpenAICaptionService(config);
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
        });

        it('should return fallback caption on failure', async () => {
            const caption = await service.generateCaption('https://example.com/photo.jpg');
            expect(caption).toBeTruthy();
        });

        it('should report healthy when configured', async () => {
            expect(await service.health()).toBe(true);
        });
    });
});
