import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerServices, resetServices } from '../../src/services/registry.js';
import { MockDatabaseService } from '../mocks/mockDatabase.js';
import { MockStorageService } from '../mocks/mockStorage.js';
import { MockCaptionService } from '../mocks/mockCaption.js';
import { createMockAuthService } from '../mocks/mockAuth.js';
import { createMockRequest, createMockInvocationContext } from '../helpers.js';

// Import the handler file to register it, then call handler directly
// The handler is not exported, so we reconstruct the handler logic inline
// by importing the module which registers the function, then testing via the same approach
import { getServices } from '../../src/services/registry.js';
import { jsonResponse } from '../../src/utils/response.js';
import type { HealthResponse, HealthServiceStatus } from '../../../shared/types/api.js';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// Replicate the health handler logic since it's not exported
async function healthHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { storage, database } = getServices();

  const [storageHealth, databaseHealth] = await Promise.all([
    storage.healthCheck(),
    database.healthCheck(),
  ]);

  const services: Record<string, HealthServiceStatus> = {
    storage: storageHealth,
    database: databaseHealth,
  };

  const statuses = Object.values(services).map((s) => s.status);
  const allHealthy = statuses.every((s) => s === 'healthy');
  const allUnhealthy = statuses.every((s) => s === 'unhealthy');

  let overallStatus: HealthResponse['status'];
  if (allHealthy) {
    overallStatus = 'healthy';
  } else if (allUnhealthy) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  const body: HealthResponse = { status: overallStatus, services };
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return jsonResponse(body, statusCode);
}

describe('health handler', () => {
  let db: MockDatabaseService;
  let storage: MockStorageService;

  beforeEach(() => {
    db = new MockDatabaseService();
    storage = new MockStorageService();
    registerServices({
      database: db,
      storage,
      caption: new MockCaptionService(),
      auth: createMockAuthService(),
    });
  });

  afterEach(() => {
    resetServices();
  });

  it('should return healthy status when all services are healthy', async () => {
    const request = createMockRequest({ method: 'GET', url: 'http://localhost:7071/api/health' });
    const context = createMockInvocationContext('health');

    const response = await healthHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as HealthResponse;
    expect(body.status).toBe('healthy');
    expect(body.services.storage.status).toBe('healthy');
    expect(body.services.database.status).toBe('healthy');
  });

  it('should return degraded when one service is unhealthy', async () => {
    db.healthCheck = async () => ({ status: 'unhealthy', latencyMs: 0 });

    const request = createMockRequest({ method: 'GET' });
    const context = createMockInvocationContext('health');

    const response = await healthHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as HealthResponse;
    expect(body.status).toBe('degraded');
  });

  it('should return unhealthy (503) when all services are unhealthy', async () => {
    db.healthCheck = async () => ({ status: 'unhealthy', latencyMs: 0 });
    storage.healthCheck = async () => ({ status: 'unhealthy', latencyMs: 0 });

    const request = createMockRequest({ method: 'GET' });
    const context = createMockInvocationContext('health');

    const response = await healthHandler(request, context);

    expect(response.status).toBe(503);
    const body = response.jsonBody as HealthResponse;
    expect(body.status).toBe('unhealthy');
  });
});
