import type { HttpRequest, InvocationContext } from '@azure/functions';
import { vi } from 'vitest';

interface MockRequestOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string>;
  formData?: FormData;
}

export function createMockRequest(options: MockRequestOptions = {}): HttpRequest {
  const {
    method = 'GET',
    url = 'http://localhost:7071/api/test',
    headers = {},
    body,
    params = {},
    query = {},
    formData,
  } = options;

  const headerMap = new Map<string, string>();
  for (const [key, value] of Object.entries(headers)) {
    headerMap.set(key.toLowerCase(), value);
  }

  const queryMap = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    queryMap.set(key, value);
  }

  const bodyText = body !== undefined ? JSON.stringify(body) : '';

  return {
    method,
    url,
    headers: {
      get: (name: string) => headerMap.get(name.toLowerCase()) ?? null,
      has: (name: string) => headerMap.has(name.toLowerCase()),
      set: (name: string, value: string) => headerMap.set(name.toLowerCase(), value),
      delete: (name: string) => headerMap.delete(name.toLowerCase()),
      forEach: (callback: (value: string, key: string) => void) => headerMap.forEach(callback),
      entries: () => headerMap.entries(),
      keys: () => headerMap.keys(),
      values: () => headerMap.values(),
      [Symbol.iterator]: () => headerMap[Symbol.iterator](),
      append: (name: string, value: string) => headerMap.set(name.toLowerCase(), value),
      getSetCookie: () => [],
    } as unknown as Headers,
    query: queryMap,
    params,
    text: () => Promise.resolve(bodyText),
    json: () => Promise.resolve(body),
    formData: formData ? () => Promise.resolve(formData) : () => Promise.reject(new Error('No form data')),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    body: null,
    bodyUsed: false,
    clone: () => createMockRequest(options),
    user: null,
  } as unknown as HttpRequest;
}

export function createMockInvocationContext(functionName = 'test'): InvocationContext {
  return {
    invocationId: 'test-invocation-id',
    functionName,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    extraInputs: { get: vi.fn(), set: vi.fn() },
    extraOutputs: { get: vi.fn(), set: vi.fn() },
    options: {},
    retryContext: undefined,
    traceContext: undefined,
    triggerMetadata: undefined,
  } as unknown as InvocationContext;
}
