import { spawn } from 'node:child_process';

const processes = [
  spawn('pnpm', ['run', 'dev:site'], { stdio: 'inherit' }),
  spawn('pnpm', ['run', 'dev:extension'], { stdio: 'inherit' }),
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
