import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest';
import { registerServices, resetServices } from '../../src/services/registry.js';
import { MockDatabaseService } from '../mocks/mockDatabase.js';
import { MockStorageService } from '../mocks/mockStorage.js';
import { MockCaptionService } from '../mocks/mockCaption.js';
import { createMockAuthService } from '../mocks/mockAuth.js';
import { createMockRequest, createMockInvocationContext } from '../helpers.js';
import type { IAuthService } from '../../src/services/interfaces/auth.js';
import type { HttpRequest, InvocationContext, HttpResponseInit } from '@azure/functions';

type HandlerFn = (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>;
let listHandler: HandlerFn;

vi.mock('@azure/functions', () => ({
  app: {
    http: (_name: string, options: { handler: HandlerFn }) => {
      listHandler = options.handler;
    },
  },
}));

beforeAll(async () => {
  await import('../../src/functions/photos-list.js');
});

describe('Photos List Handler', () => {
  let mockDatabase: MockDatabaseService;
  let mockAuth: IAuthService;

  beforeEach(async () => {
    mockDatabase = new MockDatabaseService();
    mockAuth = createMockAuthService();
    registerServices({
      database: mockDatabase,
      storage: new MockStorageService(),
      caption: new MockCaptionService(),
      auth: mockAuth,
    });

    await mockDatabase.createUser({
      id: 'usr-001',
      email: 'sarah@example.com',
      displayName: 'Sarah',
      passwordHash: 'hash',
      coupleId: 'cpl-001',
    });
    await mockDatabase.createCouple({ id: 'cpl-001', user1Id: 'usr-001', user2Id: 'usr-002' });
  });

  afterEach(() => {
    resetServices();
  });

  it('should list photos (200)', async () => {
    await mockDatabase.createPhoto({
      id: 'pht-001',
      coupleId: 'cpl-001',
      uploadedBy: 'usr-001',
      blobUrl: 'https://fake.blob.core.windows.net/photos/test.jpg',
      caption: 'Test',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
    });

    const token = mockAuth.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const context = createMockInvocationContext('photos-list');

    const response = await listHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as { photos: unknown[]; total: number };
    expect(body.photos).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  it('should return empty list when no photos', async () => {
    const token = mockAuth.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const context = createMockInvocationContext('photos-list');

    const response = await listHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as { photos: unknown[]; total: number };
    expect(body.photos).toHaveLength(0);
    expect(body.total).toBe(0);
  });

  it('should return 403 when not in a couple', async () => {
    await mockDatabase.createUser({
      id: 'usr-003',
      email: 'single@example.com',
      displayName: 'Single',
      passwordHash: 'hash',
      coupleId: null,
    });

    const token = mockAuth.generateToken('usr-003', 'single@example.com');
    const request = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const context = createMockInvocationContext('photos-list');

    const response = await listHandler(request, context);

    expect(response.status).toBe(403);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
