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
let deletePhotoHandler: HandlerFn;

vi.mock('@azure/functions', () => ({
  app: {
    http: (_name: string, options: { handler: HandlerFn }) => {
      deletePhotoHandler = options.handler;
    },
  },
}));

beforeAll(async () => {
  await import('../../src/functions/photos-delete.js');
});

describe('Photos Delete Handler', () => {
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
    await mockDatabase.createPhoto({
      id: 'pht-001',
      coupleId: 'cpl-001',
      uploadedBy: 'usr-001',
      blobUrl: 'https://fakestorage.blob.core.windows.net/photos/cpl-001/pht-001.jpeg',
      caption: 'Test photo',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
    });
  });

  afterEach(() => {
    resetServices();
  });

  it('should delete a photo (200)', async () => {
    const token = mockAuth.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
      params: { id: 'pht-001' },
    });
    const context = createMockInvocationContext('photos-delete');

    const response = await deletePhotoHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as { success: boolean };
    expect(body.success).toBe(true);
    expect(mockDatabase.photos).toHaveLength(0);
  });

  it('should return 404 when photo not found', async () => {
    const token = mockAuth.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
      params: { id: 'nonexistent' },
    });
    const context = createMockInvocationContext('photos-delete');

    const response = await deletePhotoHandler(request, context);

    expect(response.status).toBe(404);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('should return 403 when photo belongs to another couple', async () => {
    await mockDatabase.createUser({
      id: 'usr-003',
      email: 'other@example.com',
      displayName: 'Other',
      passwordHash: 'hash',
      coupleId: 'cpl-002',
    });
    await mockDatabase.createCouple({ id: 'cpl-002', user1Id: 'usr-003', user2Id: 'usr-004' });

    const token = mockAuth.generateToken('usr-003', 'other@example.com');
    const request = createMockRequest({
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
      params: { id: 'pht-001' },
    });
    const context = createMockInvocationContext('photos-delete');

    const response = await deletePhotoHandler(request, context);

    expect(response.status).toBe(403);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
