export const DEFAULT_SITE_PORT = 3000;

export function resolveSitePort(environment = process.env) {
  const rawPort = environment.FLAQ_SITE_PORT?.trim() || String(DEFAULT_SITE_PORT);
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`FLAQ_SITE_PORT must be an integer between 1 and 65535. Received: ${rawPort}`);
  }

  return port;
}

export function resolveDevelopmentSiteOrigin(environment = process.env) {
  return `http://localhost:${resolveSitePort(environment)}`;
}
