import { HttpRequest } from '@azure/functions';

export function createMockRequest(options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: unknown;
    params?: Record<string, string>;
    formData?: FormData;
}): HttpRequest {
    const { method = 'GET', url = 'http://localhost/api/test', headers = {}, body, params = {} } = options;

    const request = new HttpRequest({
        method,
        url,
        headers,
        body: body ? { string: JSON.stringify(body) } : undefined,
        params,
    });

    if (body) {
        (request as any).json = async () => body;
    }

    if (options.formData) {
        (request as any).formData = async () => options.formData;
    }

    return request;
}

export function createAuthHeaders(token = 'mock-token'): Record<string, string> {
    return { authorization: `Bearer ${token}` };
}
