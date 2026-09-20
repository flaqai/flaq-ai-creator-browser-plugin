import { describe, expect, it } from 'vitest';

import { getCreatorVideoPresentation } from '../web/flaq-saas/components/unified-generator/creator-video-presentation';

const baseItem = {
  id: 'task-12345678',
  traceId: 'task-12345678',
  platformName: 'seedance',
  categoryName: '',
  createTime: 1,
  duration: 4,
  errorInfo: '',
  imageEndUrl: '',
  imageUrl: 'https://assets.example/input.png',
  prompt: 'test prompt',
  videoId: 'task-12345678',
  videoThumbnailUrl: 'https://assets.example/input.png',
  videoUrl: '',
  videoType: 'Image-to-video' as const,
};

describe('creator video history presentation', () => {
  it('shows an explicit loading state even when a pending task has a cover', () => {
    expect(getCreatorVideoPresentation({ ...baseItem, status: 'processing' })).toMatchObject({
      state: 'processing',
      href: undefined,
      showSpinner: true,
      showPlay: false,
    });
  });

  it('makes a completed video visibly playable', () => {
    expect(getCreatorVideoPresentation({
      ...baseItem,
      status: 'completed',
      videoUrl: 'https://assets.example/result.mp4',
    })).toMatchObject({
      state: 'completed',
      href: 'https://assets.example/result.mp4',
      showSpinner: false,
      showPlay: true,
    });
  });

  it('surfaces a failed task without making it interactive', () => {
    expect(getCreatorVideoPresentation({ ...baseItem, status: 'fail' })).toMatchObject({
      state: 'failed',
      href: undefined,
      showSpinner: false,
      showPlay: false,
    });
  });
});
