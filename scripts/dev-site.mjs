import { spawn } from 'node:child_process';

import { resolveSitePort } from './site-config.mjs';

const sitePort = resolveSitePort();
const child = spawn(
  'pnpm',
  ['--dir', 'web/flaq-saas', 'exec', 'next', 'dev', '-p', String(sitePort)],
  {
    env: { ...process.env, WATCHPACK_POLLING: 'true' },
    stdio: 'inherit',
  },
);
let stopping = false;

function forwardSignal(signal) {
  stopping = true;
  if (!child.killed) child.kill(signal);
}

child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  process.exitCode = stopping || signal ? 0 : (code ?? 1);
});

process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));
