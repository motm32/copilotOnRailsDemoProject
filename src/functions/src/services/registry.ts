import type { IStorageService } from './interfaces/storage.js';
import type { IDatabaseService } from './interfaces/database.js';
import type { IAuthService } from './interfaces/auth.js';
import type { ICaptionService } from './interfaces/captions.js';
import { loadConfig } from './config.js';
import { BlobStorageService } from './storage.js';
import { PostgresDatabase } from './database.js';
import { MockAuthService } from './auth.js';
import { OpenAICaptionService } from './captions.js';

export interface Services {
    storage: IStorageService;
    database: IDatabaseService;
    auth: IAuthService;
    captions: ICaptionService;
}

let services: Services | null = null;

function initializeServices(): Services {
    const config = loadConfig();
    return {
        storage: new BlobStorageService(config),
        database: new PostgresDatabase(config),
        auth: new MockAuthService(config),
        captions: new OpenAICaptionService(config),
    };
}

export function getServices(): Services {
    if (!services) {
        services = initializeServices();
    }
    return services;
}

export function registerServices(s: Services): void {
    services = s;
}
