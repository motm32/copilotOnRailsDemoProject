import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerServices, resetServices, getServices } from '../../src/services/registry.js';
import { MockDatabaseService } from '../mocks/mockDatabase.js';
import { MockStorageService } from '../mocks/mockStorage.js';
import { MockCaptionService } from '../mocks/mockCaption.js';
import { createMockAuthService } from '../mocks/mockAuth.js';
import { createMockRequest, createMockInvocationContext } from '../helpers.js';
import { hashPassword } from '../../src/utils/password.js';
import { handleError, ConflictError, ValidationError } from '../../src/errors/index.js';
import { createdResponse } from '../../src/utils/response.js';
import { registerSchema } from '../../../shared/schemas/validation.js';
import { randomUUID } from 'node:crypto';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import type { PublicUser } from '../../../shared/types/api.js';

// Replicate handler since it's not exported
async function registerHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid request body', parsed.error.flatten());
    }

    const { email, displayName, password } = parsed.data;
    const { database, auth } = getServices();

    const existing = await database.getUserByEmail(email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await database.createUser({
      id: randomUUID(),
      email,
      displayName,
      passwordHash,
      coupleId: null,
    });

    const token = auth.generateToken(user.id, user.email);
    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      coupleId: user.coupleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return createdResponse({ user: publicUser, token });
  } catch (err) {
    return handleError(err);
  }
}

describe('auth-register handler', () => {
  let db: MockDatabaseService;

  beforeEach(() => {
    db = new MockDatabaseService();
    registerServices({
      database: db,
      storage: new MockStorageService(),
      caption: new MockCaptionService(),
      auth: createMockAuthService(),
    });
  });

  afterEach(() => {
    resetServices();
  });

  it('should register a new user (201)', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'new@example.com',
        displayName: 'New User',
        password: 'password123',
      },
    });
    const context = createMockInvocationContext('auth-register');

    const response = await registerHandler(request, context);

    expect(response.status).toBe(201);
    const body = response.jsonBody as { user: PublicUser; token: string };
    expect(body.user.email).toBe('new@example.com');
    expect(body.user.displayName).toBe('New User');
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe('string');
    expect(db.users).toHaveLength(1);
  });

  it('should return 409 for duplicate email', async () => {
    await db.createUser({
      id: 'existing-user',
      email: 'existing@example.com',
      displayName: 'Existing',
      passwordHash: 'hash',
      coupleId: null,
    });

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'existing@example.com',
        displayName: 'Another',
        password: 'password123',
      },
    });
    const context = createMockInvocationContext('auth-register');

    const response = await registerHandler(request, context);

    expect(response.status).toBe(409);
  });

  it('should return 422 for invalid body', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'not-an-email' },
    });
    const context = createMockInvocationContext('auth-register');

    const response = await registerHandler(request, context);

    expect(response.status).toBe(422);
  });
});
