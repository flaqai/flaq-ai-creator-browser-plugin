import { spawn } from 'node:child_process';
import { once } from 'node:events';

import { resolveDevelopmentSiteOrigin, resolveSitePort } from './site-config.mjs';

const sitePort = resolveSitePort();
const siteOrigin = resolveDevelopmentSiteOrigin();
const sharedEnvironment = {
  ...process.env,
  FLAQ_SITE_PORT: String(sitePort),
  VITE_SIDEPANEL_SITE_URL: siteOrigin,
};

console.log(`Using FLAQ site origin: ${siteOrigin}`);
console.log('Building the unpacked extension with the matching iframe origin...');

const build = spawn('pnpm', ['run', 'build:dev'], {
  env: sharedEnvironment,
  stdio: 'inherit',
});
const [buildCode] = await once(build, 'exit');

if (buildCode !== 0) {
  process.exitCode = buildCode ?? 1;
  throw new Error('Extension development build failed.');
}

const processes = [
  spawn('pnpm', ['run', 'dev:site'], { env: sharedEnvironment, stdio: 'inherit' }),
  spawn('pnpm', ['run', 'dev:extension'], { env: sharedEnvironment, stdio: 'inherit' }),
];

let stopping = false;

function stopAll(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (!child.killed) child.kill(signal);
  }
}

for (const child of processes) {
  child.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
    stopAll();
  });

  child.on('exit', (code, signal) => {
    if (stopping) return;
    process.exitCode = code ?? (signal ? 1 : 0);
    stopAll();
  });
}

process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));
