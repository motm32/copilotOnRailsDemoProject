import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerServices, resetServices, getServices } from '../../src/services/registry.js';
import { MockDatabaseService } from '../mocks/mockDatabase.js';
import { MockStorageService } from '../mocks/mockStorage.js';
import { MockCaptionService } from '../mocks/mockCaption.js';
import { createMockAuthService } from '../mocks/mockAuth.js';
import { createMockRequest, createMockInvocationContext } from '../helpers.js';
import { authenticateRequest } from '../../src/middleware/auth.js';
import { handleError, ConflictError } from '../../src/errors/index.js';
import { createdResponse } from '../../src/utils/response.js';
import { randomUUID, randomBytes } from 'node:crypto';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import type { IAuthService } from '../../src/services/interfaces/auth.js';

const INVITE_EXPIRY_HOURS = 24;

// Replicate handler
async function inviteHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticateRequest(request);
    const { database } = getServices();

    const existingCouple = await database.getCoupleByUserId(userId);
    if (existingCouple) {
      throw new ConflictError('You are already in a couple');
    }

    const activeInvite = await database.getActiveInviteByUser(userId);
    if (activeInvite) {
      return createdResponse({
        inviteCode: activeInvite.code,
        expiresAt: activeInvite.expiresAt.toISOString(),
      });
    }

    const code = randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    const invite = await database.createInviteCode({
      id: randomUUID(),
      code,
      createdBy: userId,
      usedBy: null,
      expiresAt,
    });

    return createdResponse({
      inviteCode: invite.code,
      expiresAt: invite.expiresAt.toISOString(),
    });
  } catch (err) {
    return handleError(err);
  }
}

describe('couples-invite handler', () => {
  let db: MockDatabaseService;
  let authService: IAuthService;

  beforeEach(() => {
    db = new MockDatabaseService();
    authService = createMockAuthService();
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

  it('should generate an invite code (201)', async () => {
    await db.createUser({
      id: 'usr-001',
      email: 'sarah@example.com',
      displayName: 'Sarah',
      passwordHash: 'hash',
      coupleId: null,
    });

    const token = authService.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    const context = createMockInvocationContext('couples-invite');

    const response = await inviteHandler(request, context);

    expect(response.status).toBe(201);
    const body = response.jsonBody as { inviteCode: string; expiresAt: string };
    expect(body.inviteCode).toBeDefined();
    expect(body.expiresAt).toBeDefined();
  });

  it('should return 409 if user is already paired', async () => {
    await db.createUser({
      id: 'usr-001',
      email: 'sarah@example.com',
      displayName: 'Sarah',
      passwordHash: 'hash',
      coupleId: 'cpl-001',
    });
    await db.createCouple({
      id: 'cpl-001',
      user1Id: 'usr-001',
      user2Id: 'usr-002',
    });

    const token = authService.generateToken('usr-001', 'sarah@example.com');
    const request = createMockRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    const context = createMockInvocationContext('couples-invite');

    const response = await inviteHandler(request, context);

    expect(response.status).toBe(409);
  });
});
