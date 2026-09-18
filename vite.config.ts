import fs from 'node:fs';
import path from 'node:path';

import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const DEVELOPMENT_SITE_URL = 'http://localhost:3000';

function getSiteUrl(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  const configuredUrl = env.VITE_SIDEPANEL_SITE_URL?.trim();

  if (mode === 'production' && !configuredUrl) {
    throw new Error('VITE_SIDEPANEL_SITE_URL is required for a production extension build.');
  }

  const siteUrl = configuredUrl || DEVELOPMENT_SITE_URL;
  const parsed = new URL(siteUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('VITE_SIDEPANEL_SITE_URL must use http or https.');
  }

  return { siteUrl: parsed.origin, siteOrigin: parsed.origin };
}

function writeManifest(siteOrigin: string): Plugin {
  return {
    name: 'write-sidepanel-manifest',
    closeBundle() {
      const manifestPath = path.resolve('dist/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
        content_security_policy: { extension_pages: string };
      };
      manifest.content_security_policy.extension_pages =
        `script-src 'self'; object-src 'self'; connect-src ${siteOrigin}; frame-src ${siteOrigin};`;
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const { siteUrl, siteOrigin } = getSiteUrl(mode);

  return {
    plugins: [react(), writeManifest(siteOrigin)],
    define: {
      'import.meta.env.VITE_SIDEPANEL_SITE_URL': JSON.stringify(siteUrl),
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
