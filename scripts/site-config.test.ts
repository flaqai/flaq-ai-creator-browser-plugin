import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SITE_PORT,
  resolveDevelopmentSiteOrigin,
  resolveSitePort,
} from './site-config.mjs';

describe('development site configuration', () => {
  it('uses the fixed default port when no override is provided', () => {
    expect(resolveSitePort({})).toBe(DEFAULT_SITE_PORT);
    expect(resolveDevelopmentSiteOrigin({})).toBe('http://localhost:3000');
  });

  it('uses one port override for the shared site origin', () => {
    expect(resolveSitePort({ FLAQ_SITE_PORT: '3100' })).toBe(3100);
    expect(resolveDevelopmentSiteOrigin({ FLAQ_SITE_PORT: '3100' })).toBe(
      'http://localhost:3100',
    );
  });

  it.each(['0', '65536', 'abc', '3000.5'] as const)('rejects invalid port %s', (port) => {
    expect(() => resolveSitePort({ FLAQ_SITE_PORT: port })).toThrow(
      'FLAQ_SITE_PORT must be an integer between 1 and 65535',
    );
  });
});
