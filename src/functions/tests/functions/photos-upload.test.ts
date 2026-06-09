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
let uploadHandler: HandlerFn;

vi.mock('@azure/functions', () => ({
  app: {
    http: (_name: string, options: { handler: HandlerFn }) => {
      uploadHandler = options.handler;
    },
  },
}));

beforeAll(async () => {
  await import('../../src/functions/photos-upload.js');
});

describe('Photos Upload Handler', () => {
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

  it('should upload a photo (201)', async () => {
    const imageBuffer = Buffer.from('fake-image-data');
    const file = new Blob([imageBuffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.set('file', file, 'photo.jpg');

    const token = mockAuth.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      formData,
    });
    const context = createMockInvocationContext('photos-upload');

    const response = await uploadHandler(request, context);

    expect(response.status).toBe(201);
    const body = response.jsonBody as { photo: { coupleId: string; mimeType: string; caption: string } };
    expect(body.photo).toBeDefined();
    expect(body.photo.coupleId).toBe('cpl-001');
    expect(body.photo.mimeType).toBe('image/jpeg');
    expect(body.photo.caption).toBe('A lovely photo of us together');
  });

  it('should return 422 when no file provided', async () => {
    const formData = new FormData();

    const token = mockAuth.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      formData,
    });
    const context = createMockInvocationContext('photos-upload');

    const response = await uploadHandler(request, context);

    expect(response.status).toBe(422);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 403 when not in a couple', async () => {
    // Create user not in a couple
    await mockDatabase.createUser({
      id: 'usr-003',
      email: 'single@example.com',
      displayName: 'Single',
      passwordHash: 'hash',
      coupleId: null,
    });

    const imageBuffer = Buffer.from('fake-image-data');
    const file = new Blob([imageBuffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.set('file', file, 'photo.jpg');

    const token = mockAuth.generateToken('usr-003', 'single@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      formData,
    });
    const context = createMockInvocationContext('photos-upload');

    const response = await uploadHandler(request, context);

    expect(response.status).toBe(403);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('FORBIDDEN');
  });
});
