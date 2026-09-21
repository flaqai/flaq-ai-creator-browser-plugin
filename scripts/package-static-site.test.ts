import { describe, expect, it } from 'vitest';

import { externalizeInlineScripts } from './package-static-site.mjs';

describe('static SaaS packaging', () => {
  it('moves executable inline scripts into extension-owned files', () => {
    const result = externalizeInlineScripts(
      '<script>self.__next_f.push([1])</script><script src="/site/app.js"></script>',
    );

    expect(result.html).toMatch(/src="\/site\/_inline\/[a-f0-9]{20}\.js"/);
    expect(result.html).toContain('<script src="/site/app.js"></script>');
    expect([...result.scripts.values()]).toEqual(['self.__next_f.push([1])']);
  });

  it('drops JSON-LD because extension pages do not need crawler metadata', () => {
    const result = externalizeInlineScripts(
      '<script type="application/ld+json">{"name":"FLAQ"}</script>',
    );

    expect(result.html).toBe('');
    expect(result.scripts.size).toBe(0);
  });
});
