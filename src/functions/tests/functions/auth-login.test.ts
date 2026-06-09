import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerServices, resetServices, getServices } from '../../src/services/registry.js';
import { MockDatabaseService } from '../mocks/mockDatabase.js';
import { MockStorageService } from '../mocks/mockStorage.js';
import { MockCaptionService } from '../mocks/mockCaption.js';
import { createMockAuthService } from '../mocks/mockAuth.js';
import { createMockRequest, createMockInvocationContext } from '../helpers.js';
import { hashPassword, verifyPassword } from '../../src/utils/password.js';
import { handleError, UnauthorizedError, ValidationError } from '../../src/errors/index.js';
import { jsonResponse } from '../../src/utils/response.js';
import { loginSchema } from '../../../shared/schemas/validation.js';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import type { PublicUser } from '../../../shared/types/api.js';

// Replicate handler
async function loginHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid request body', parsed.error.flatten());
    }

    const { email, password } = parsed.data;
    const { database, auth } = getServices();

    const user = await database.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = auth.generateToken(user.id, user.email);
    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      coupleId: user.coupleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return jsonResponse({ user: publicUser, token });
  } catch (err) {
    return handleError(err);
  }
}

describe('auth-login handler', () => {
  let db: MockDatabaseService;

  beforeEach(async () => {
    db = new MockDatabaseService();
    const passwordHash = await hashPassword('password123');
    await db.createUser({
      id: 'usr-001',
      email: 'sarah@example.com',
      displayName: 'Sarah',
      passwordHash,
      coupleId: null,
    });
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

  it('should login with valid credentials (200)', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'sarah@example.com', password: 'password123' },
    });
    const context = createMockInvocationContext('auth-login');

    const response = await loginHandler(request, context);

    expect(response.status).toBe(200);
    const body = response.jsonBody as { user: PublicUser; token: string };
    expect(body.user.email).toBe('sarah@example.com');
    expect(body.token).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'sarah@example.com', password: 'wrongpassword' },
    });
    const context = createMockInvocationContext('auth-login');

    const response = await loginHandler(request, context);

    expect(response.status).toBe(401);
  });

  it('should return 401 for non-existent user', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'nobody@example.com', password: 'password123' },
    });
    const context = createMockInvocationContext('auth-login');

    const response = await loginHandler(request, context);

    expect(response.status).toBe(401);
  });

  it('should return 422 for invalid body', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'bad-email' },
    });
    const context = createMockInvocationContext('auth-login');

    const response = await loginHandler(request, context);

    expect(response.status).toBe(422);
  });
});
