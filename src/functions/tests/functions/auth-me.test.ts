import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerServices, resetServices, getServices } from '../../src/services/registry.js';
import { MockDatabaseService } from '../mocks/mockDatabase.js';
import { MockStorageService } from '../mocks/mockStorage.js';
import { MockCaptionService } from '../mocks/mockCaption.js';
import { createMockAuthService } from '../mocks/mockAuth.js';
import { createMockRequest, createMockInvocationContext } from '../helpers.js';
import { authenticateRequest } from '../../src/middleware/auth.js';
import { handleError } from '../../src/errors/index.js';
import { jsonResponse } from '../../src/utils/response.js';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import type { PublicUser } from '../../../shared/types/api.js';
import type { IAuthService } from '../../src/services/interfaces/auth.js';

// Replicate handler
async function meHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const { database } = getServices();

    const user = await database.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      coupleId: user.coupleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return jsonResponse({ user: publicUser });
  } catch (err) {
    return handleError(err);
  }
}

describe('auth-me handler', () => {
  let db: MockDatabaseService;
  let authService: IAuthService;

  beforeEach(async () => {
    db = new MockDatabaseService();
    authService = createMockAuthService();

    await db.createUser({
      id: 'usr-001',
      email: 'sarah@example.com',
      displayName: 'Sarah',
      passwordHash: 'hash',
      coupleId: null,
    });

    registerServices({
      database: db,
      storage: new MockStorageService(),
      caption: new MockCaptionService(),
      auth: authService,
    });
  });

  afterEach(() => {
    resetServices();
  });

  it('should return the current user (200)', async () => {
    const token = authService.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
    });
    const context = createMockInvocationContext('auth-me');

    const response = await meHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as { user: PublicUser };
    expect(body.user.email).toBe('sarah@example.com');
    expect(body.user.displayName).toBe('Sarah');
  });

  it('should return 401 without token', async () => {
    const request = createMockRequest({ method: 'GET' });
    const context = createMockInvocationContext('auth-me');

    const response = await meHandler(request, context);

    expect(response.status).toBe(401);
  });
});
