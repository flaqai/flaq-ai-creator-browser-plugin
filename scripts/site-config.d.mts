export const DEFAULT_SITE_PORT: number;

export function resolveSitePort(environment?: Record<string, string | undefined>): number;

export function resolveDevelopmentSiteOrigin(
  environment?: Record<string, string | undefined>,
): string;
