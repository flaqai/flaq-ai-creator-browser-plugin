import { afterEach, describe, expect, it, vi } from 'vitest';

import { logGenerationEvent } from '../web/flaq-saas/lib/generation-log';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generation logs', () => {
  it('keeps correlation fields while shortening provider task IDs', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logGenerationEvent({
      phase: 'polling.status',
      operationId: 'operation-1',
      mediaType: 'video',
      taskId: '12345678-secret-rest',
      attempt: 2,
      status: 'processing',
    });

    expect(info).toHaveBeenCalledWith('[FLAQ generation]', expect.objectContaining({
      operationId: 'operation-1',
      taskRef: '12345678',
      attempt: 2,
      status: 'processing',
    }));
  });

  it('redacts URLs and credential-shaped values from errors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    logGenerationEvent({
      phase: 'polling.retry',
      operationId: 'operation-2',
      mediaType: 'video',
      error: new Error('request https://private.example/result failed; clientKey=very-secret'),
    });

    const payload = warn.mock.calls[0]?.[1] as { error: { message: string } };
    expect(payload.error.message).toContain('<redacted-url>');
    expect(payload.error.message).toContain('clientKey=<redacted>');
    expect(payload.error.message).not.toContain('very-secret');
  });
});
