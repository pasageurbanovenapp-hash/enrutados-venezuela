import { describe, expect, it } from 'vitest';
import { loadConfig } from './env';

describe('loadConfig', () => {
  it('loads a valid port', () => {
    expect(loadConfig({ PORT: '3000' })).toEqual({
      port: 3000,
      corsOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    });
  });

  it.each([undefined, '', '0', '65536', '3.14', 'abc'])('rejects invalid PORT: %s', (port) => {
    expect(() => loadConfig({ PORT: port })).toThrow();
  });

  it('requires CORS origins in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production', PORT: '3000' })).toThrow(
      'CORS_ORIGINS environment variable is required in production.',
    );
  });

  it('parses configured CORS origins', () => {
    expect(
      loadConfig({
        CORS_ORIGINS: 'https://app.example.com, https://admin.example.com',
        NODE_ENV: 'production',
        PORT: '3000',
      }).corsOrigins,
    ).toEqual(['https://app.example.com', 'https://admin.example.com']);
  });
});