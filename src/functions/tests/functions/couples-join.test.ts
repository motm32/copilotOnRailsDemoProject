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
let joinHandler: HandlerFn;

vi.mock('@azure/functions', () => ({
  app: {
    http: (_name: string, options: { handler: HandlerFn }) => {
      joinHandler = options.handler;
    },
  },
}));

// Static import triggers app.http mock, capturing the handler
beforeAll(async () => {
  await import('../../src/functions/couples-join.js');
});

describe('Couples Join Handler', () => {
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

    // Create inviter (usr-001) and joiner (usr-002)
    await mockDatabase.createUser({
      id: 'usr-001',
      email: 'sarah@example.com',
      displayName: 'Sarah',
      passwordHash: 'hash',
      coupleId: null,
    });
    await mockDatabase.createUser({
      id: 'usr-002',
      email: 'mike@example.com',
      displayName: 'Mike',
      passwordHash: 'hash',
      coupleId: null,
    });

    // Create a valid invite code
    await mockDatabase.createInviteCode({
      id: 'inv-001',
      code: 'TESTCODE',
      createdBy: 'usr-001',
      usedBy: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  });

  afterEach(() => {
    resetServices();
  });

  it('should join with a valid invite code (200)', async () => {
    const token = mockAuth.generateToken('usr-002', 'mike@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { inviteCode: 'TESTCODE' },
    });
    const context = createMockInvocationContext('couples-join');

    const response = await joinHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as { couple: { user1Id: string; user2Id: string } };
    expect(body.couple).toBeDefined();
    expect(body.couple.user1Id).toBe('usr-001');
    expect(body.couple.user2Id).toBe('usr-002');
  });

  it('should return 404 for invalid invite code', async () => {
    const token = mockAuth.generateToken('usr-002', 'mike@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { inviteCode: 'BADCODE' },
    });
    const context = createMockInvocationContext('couples-join');

    const response = await joinHandler(request, context);

    expect(response.status).toBe(404);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('should return 404 for expired invite code', async () => {
    // Create an expired invite
    await mockDatabase.createInviteCode({
      id: 'inv-expired',
      code: 'EXPIRED',
      createdBy: 'usr-001',
      usedBy: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    const token = mockAuth.generateToken('usr-002', 'mike@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { inviteCode: 'EXPIRED' },
    });
    const context = createMockInvocationContext('couples-join');

    const response = await joinHandler(request, context);

    expect(response.status).toBe(404);
  });

  it('should return 409 when already in a couple', async () => {
    // Put joiner in a couple already
    await mockDatabase.createCouple({ id: 'cpl-existing', user1Id: 'usr-002', user2Id: 'usr-003' });

    const token = mockAuth.generateToken('usr-002', 'mike@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { inviteCode: 'TESTCODE' },
    });
    const context = createMockInvocationContext('couples-join');

    const response = await joinHandler(request, context);

    expect(response.status).toBe(409);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('CONFLICT');
  });
});
