import { describe, expect, it } from 'vitest';
import { HealthCheckResponse } from './generated/api';
import type { ErrorResponse } from './generated/types';

describe('HealthCheckResponse', () => {
  it('accepts a valid health response', () => {
    expect(HealthCheckResponse.parse({ status: 'ok' })).toEqual({ status: 'ok' });
  });

  it('rejects a response without status', () => {
    expect(() => HealthCheckResponse.parse({})).toThrow();
  });

  it('keeps the documented error response shape type-safe', () => {
    const response = {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    } satisfies ErrorResponse;

    expect(response.error.code).toBe('NOT_FOUND');
  });
});