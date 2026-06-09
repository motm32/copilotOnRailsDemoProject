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
let coupleMeHandler: HandlerFn;

vi.mock('@azure/functions', () => ({
  app: {
    http: (_name: string, options: { handler: HandlerFn }) => {
      coupleMeHandler = options.handler;
    },
  },
}));

beforeAll(async () => {
  await import('../../src/functions/couples-me.js');
});

describe('Couples Me Handler', () => {
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
    await mockDatabase.createUser({
      id: 'usr-002',
      email: 'mike@example.com',
      displayName: 'Mike',
      passwordHash: 'hash',
      coupleId: 'cpl-001',
    });
    await mockDatabase.createCouple({ id: 'cpl-001', user1Id: 'usr-001', user2Id: 'usr-002' });
  });

  afterEach(() => {
    resetServices();
  });

  it('should return couple info and partner (200)', async () => {
    const token = mockAuth.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const context = createMockInvocationContext('couples-me');

    const response = await coupleMeHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as { couple: { id: string }; partner: { id: string; displayName: string } };
    expect(body.couple.id).toBe('cpl-001');
    expect(body.partner.id).toBe('usr-002');
    expect(body.partner.displayName).toBe('Mike');
  });

  it('should return 404 when not in a couple', async () => {
    // Create a user not in a couple
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
    const context = createMockInvocationContext('couples-me');

    const response = await coupleMeHandler(request, context);

    expect(response.status).toBe(404);
    const body = response.jsonBody as { error: { code: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
