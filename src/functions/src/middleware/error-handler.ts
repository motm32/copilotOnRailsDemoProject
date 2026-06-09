import type { HttpResponseInit } from '@azure/functions';
import { AppError } from '../errors/index.js';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function handleError(error: unknown): HttpResponseInit {
    if (error instanceof AppError) {
        return {
            status: error.statusCode,
            jsonBody: {
                error: { code: error.code, message: error.message, details: error.details ?? null },
            },
        };
    }

    if (error instanceof ZodError) {
        return {
            status: 422,
            jsonBody: {
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
                },
            },
        };
    }

    logger.error({ err: error }, 'Unhandled error');

    return {
        status: 500,
        jsonBody: {
            error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: null },
        },
    };
}
