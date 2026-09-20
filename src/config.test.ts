import { describe, expect, it } from 'vitest';

import { buildCreatorUrl, resolveSiteLocale } from './config';

describe('side-panel site configuration', () => {
  it('maps browser languages to supported site locales', () => {
    expect(resolveSiteLocale('zh-CN')).toBe('zh');
    expect(resolveSiteLocale('zh-HK')).toBe('tw');
    expect(resolveSiteLocale('pt-BR')).toBe('pt');
    expect(resolveSiteLocale('unknown')).toBe('en');
  });

  it('builds the localized AI creator route', () => {
    expect(buildCreatorUrl('http://localhost:3000', 'en-US')).toBe(
      'http://localhost:3000/ai-media-creator/',
    );
    expect(buildCreatorUrl('https://creator.example', 'ja-JP')).toBe(
      'https://creator.example/ja/ai-media-creator/',
    );
  });
});
