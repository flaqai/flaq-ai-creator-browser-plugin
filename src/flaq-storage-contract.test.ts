import { describe, expect, it } from 'vitest';

import {
  createFlaqPresignedUrlBody,
  FLAQ_PRESIGNED_URL_PATH,
  validateFlaqUploadCount,
} from '../web/flaq-saas/network/upload/flaq-storage-contract';

describe('Flaq default image hosting contract', () => {
  it('uses the Client Key presigned URL endpoint and desktop request shape', () => {
    expect(FLAQ_PRESIGNED_URL_PATH).toBe('/api/v1/files/presignedUrl');
    expect(createFlaqPresignedUrlBody(['image/png', 'video/mp4'])).toEqual({
      files: [{ mime_type: 'image/png' }, { mime_type: 'video/mp4' }],
    });
  });

  it('limits one authorization request to ten files', () => {
    expect(() => validateFlaqUploadCount(10)).not.toThrow();
    expect(() => validateFlaqUploadCount(11)).toThrow(/at most 10 files/);
  });
});
