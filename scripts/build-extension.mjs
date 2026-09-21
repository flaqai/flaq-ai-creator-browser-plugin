import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';

import { packageStaticSite } from './package-static-site.mjs';

const mode = process.argv[2] || 'production';
const rootDirectory = process.cwd();

async function run(command, args, environment = process.env) {
  const child = spawn(command, args, { cwd: rootDirectory, env: environment, stdio: 'inherit' });
  const [code] = await once(child, 'exit');
  if (code !== 0) throw new Error(`${command} ${args.join(' ')} exited with code ${code ?? 1}.`);
}

await run('pnpm', ['--dir', 'web/flaq-saas', 'ts-check']);
await run('pnpm', ['--dir', 'web/flaq-saas', 'build'], {
  ...process.env,
  FLAQ_EXTENSION_EXPORT: 'true',
  NEXT_PUBLIC_EXTENSION_EXPORT: 'true',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://flaq.ai',
});
await run('pnpm', ['exec', 'tsc', '-b']);
await run('pnpm', ['exec', 'vite', 'build', '--mode', mode], {
  ...process.env,
  VITE_EMBEDDED_SITE: 'true',
});

const result = await packageStaticSite({
  sourceDirectory: path.join(rootDirectory, 'web/flaq-saas/out'),
  publicDirectory: path.join(rootDirectory, 'web/flaq-saas/public'),
  outputDirectory: path.join(rootDirectory, 'dist'),
});

console.log(`Packaged ${result.htmlFiles} static SaaS pages and ${result.inlineScripts} CSP-safe scripts.`);
