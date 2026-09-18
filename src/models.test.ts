import { describe, expect, it } from 'vitest';
import { getImageDimensions, modelsFor } from './models';

describe('model helpers', () => {
  it('keeps image output inside the requested long edge', () => {
    expect(getImageDimensions('16:9', '2k')).toEqual({ width: 2048, height: 1152 });
    expect(getImageDimensions('9:16', '1k')).toEqual({ width: 576, height: 1024 });
  });

  it('does not mix image and video models', () => {
    expect(modelsFor('image').every((model) => model.mediaType === 'image')).toBe(true);
    expect(modelsFor('video').every((model) => model.mediaType === 'video')).toBe(true);
  });
});
