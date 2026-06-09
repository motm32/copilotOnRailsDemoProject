import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerServices, getServices, resetServices } from '../../src/services/registry.js';
import { MockDatabaseService } from '../mocks/mockDatabase.js';
import { MockStorageService } from '../mocks/mockStorage.js';
import { MockCaptionService } from '../mocks/mockCaption.js';
import { createMockAuthService } from '../mocks/mockAuth.js';
import type { Services } from '../../src/services/registry.js';

describe('Service Registry', () => {
  afterEach(() => {
    resetServices();
  });

  it('should register and return mock services', () => {
    const mockServices: Services = {
      database: new MockDatabaseService(),
      storage: new MockStorageService(),
      caption: new MockCaptionService(),
      auth: createMockAuthService(),
    };

    registerServices(mockServices);
    const services = getServices();

    expect(services).toBe(mockServices);
    expect(services.database).toBeInstanceOf(MockDatabaseService);
    expect(services.storage).toBeInstanceOf(MockStorageService);
  });

  it('should auto-init services from config when none registered', () => {
    // getServices() will create real services from env vars (set in setup.ts)
    const services = getServices();
    expect(services).toBeDefined();
    expect(services.database).toBeDefined();
    expect(services.storage).toBeDefined();
    expect(services.auth).toBeDefined();
  });

  it('should return fresh services after resetServices + getServices', () => {
    const mockServices: Services = {
      database: new MockDatabaseService(),
      storage: new MockStorageService(),
      caption: new MockCaptionService(),
      auth: createMockAuthService(),
    };

    registerServices(mockServices);
    resetServices();

    // Should not throw - will create new services from config
    const freshServices = getServices();
    expect(freshServices).toBeDefined();
    expect(freshServices).not.toBe(mockServices);
  });
});
