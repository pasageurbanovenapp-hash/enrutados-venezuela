import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from './app';

describe('API', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp({ corsOrigins: ['http://localhost:5173'] });
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Test server did not expose a TCP address.');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it('returns the health contract', async () => {
    const response = await fetch(`${baseUrl}/api/healthz`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    });
  });
});