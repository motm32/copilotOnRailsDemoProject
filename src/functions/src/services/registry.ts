import type { IStorageService } from "./interfaces/storage.js";
import type { IDatabaseService } from "./interfaces/database.js";
import type { ICaptionService } from "./interfaces/caption.js";
import type { IAuthService } from "./interfaces/auth.js";
import { BlobStorageService } from "./storage.js";
import { PostgresDatabaseService } from "./database.js";
import { OpenAICaptionService } from "./caption.js";
import { MockAuthService } from "./auth.js";
import { getConfig } from "./config.js";

export interface Services {
  storage: IStorageService;
  database: IDatabaseService;
  caption: ICaptionService;
  auth: IAuthService;
}

let registeredServices: Services | null = null;

export function registerServices(services: Services): void {
  registeredServices = services;
}

export function getServices(): Services {
  if (registeredServices) return registeredServices;

  const config = getConfig();

  registeredServices = {
    storage: new BlobStorageService(config.storageConnectionString),
    database: new PostgresDatabaseService(config.databaseUrl),
    caption: new OpenAICaptionService(
      config.azureOpenAiEndpoint,
      config.azureOpenAiApiKey
    ),
    auth: new MockAuthService(config.authSecret),
  };

  return registeredServices;
}

export function resetServices(): void {
  registeredServices = null;
}
