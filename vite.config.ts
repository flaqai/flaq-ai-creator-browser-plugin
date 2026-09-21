import fs from 'node:fs';
import path from 'node:path';

import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

import { resolveDevelopmentSiteOrigin } from './scripts/site-config.mjs';

function getSiteUrl(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  const isEmbedded = env.VITE_EMBEDDED_SITE === 'true' || process.env.VITE_EMBEDDED_SITE === 'true';
  const configuredUrl = env.VITE_SIDEPANEL_SITE_URL?.trim();

  if (isEmbedded) {
    return { isEmbedded, siteUrl: '', siteOrigin: "'self'" };
  }

  if (mode === 'production' && !configuredUrl) {
    throw new Error('VITE_SIDEPANEL_SITE_URL is required for a remote production build.');
  }

  const siteUrl = configuredUrl || resolveDevelopmentSiteOrigin({ ...env, ...process.env });
  const parsed = new URL(siteUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('VITE_SIDEPANEL_SITE_URL must use http or https.');
  }

  return { isEmbedded, siteUrl: parsed.origin, siteOrigin: parsed.origin };
}

function writeManifest(siteOrigin: string, isEmbedded: boolean): Plugin {
  return {
    name: 'write-sidepanel-manifest',
    closeBundle() {
      const manifestPath = path.resolve('dist/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
        content_security_policy: { extension_pages: string };
      };
      manifest.content_security_policy.extension_pages = isEmbedded
        ? "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'; connect-src https: http:; frame-src 'self';"
        : `script-src 'self'; object-src 'self'; connect-src ${siteOrigin}; frame-src ${siteOrigin};`;
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const { isEmbedded, siteUrl, siteOrigin } = getSiteUrl(mode);

  return {
    plugins: [react(), writeManifest(siteOrigin, isEmbedded)],
    define: {
      'import.meta.env.VITE_SIDEPANEL_SITE_URL': JSON.stringify(siteUrl),
      'import.meta.env.VITE_EMBEDDED_SITE': JSON.stringify(String(isEmbedded)),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: 'sidepanel.html',
      },
    },
  };
});
