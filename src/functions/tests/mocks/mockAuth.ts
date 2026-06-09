import { MockAuthService } from '../../src/services/auth.js';
import type { IAuthService } from '../../src/services/interfaces/auth.js';

const TEST_SECRET = 'test-secret-key-for-hmac-signing';

export function createMockAuthService(): IAuthService {
  return new MockAuthService(TEST_SECRET);
}
