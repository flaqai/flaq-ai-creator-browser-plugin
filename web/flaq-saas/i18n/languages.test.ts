import { afterEach, describe, expect, it } from 'vitest';

import { generateLanguagePaths } from './languages';

const previousExtensionExport = process.env.NEXT_PUBLIC_EXTENSION_EXPORT;

afterEach(() => {
  if (previousExtensionExport === undefined) {
    delete process.env.NEXT_PUBLIC_EXTENSION_EXPORT;
  } else {
    process.env.NEXT_PUBLIC_EXTENSION_EXPORT = previousExtensionExport;
  }
});

describe('language paths', () => {
  it('uses explicit HTML documents for extension exports', () => {
    process.env.NEXT_PUBLIC_EXTENSION_EXPORT = 'true';

    const paths = generateLanguagePaths('/site', 'ai-media-creator');

    expect(paths.en).toBe('/site/en/ai-media-creator/index.html');
    expect(paths['zh-CN']).toBe('/site/zh/ai-media-creator/index.html');
  });

  it('keeps directory routes for the hosted site', () => {
    delete process.env.NEXT_PUBLIC_EXTENSION_EXPORT;

    const paths = generateLanguagePaths('https://flaq.ai', 'ai-media-creator');

    expect(paths.en).toBe('https://flaq.ai/ai-media-creator/');
    expect(paths['zh-CN']).toBe('https://flaq.ai/zh/ai-media-creator/');
  });
});
