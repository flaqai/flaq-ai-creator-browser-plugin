import { spawn } from 'node:child_process';

const child = spawn('pnpm', ['run', 'dev:site'], {
  detached: process.platform !== 'win32',
  stdio: ['ignore', 'pipe', 'pipe'],
});

const failurePatterns = ['EMFILE', '.next/dev" was deleted'];
let finished = false;
let readyTimer;

function stopChild() {
  if (child.killed) return;
  if (process.platform === 'win32') child.kill('SIGINT');
  else process.kill(-child.pid, 'SIGINT');
}

function finish(code, message) {
  if (finished) return;
  finished = true;
  clearTimeout(readyTimer);
  clearTimeout(overallTimer);
  stopChild();
  console.log(message);
  process.exitCode = code;
}

function inspect(chunk) {
  const output = chunk.toString();
  process.stdout.write(output);

  if (failurePatterns.some((pattern) => output.includes(pattern))) {
    finish(1, 'SaaS development server entered a watcher failure loop.');
    return;
  }

  if (output.includes('Ready in') && !readyTimer) {
    readyTimer = setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:3000/ai-media-creator/');
        finish(response.ok ? 0 : 1, `SaaS smoke response: ${response.status}`);
      } catch (error) {
        finish(1, `SaaS smoke request failed: ${error.message}`);
      }
    }, 1_000);
  }
}

child.stdout.on('data', inspect);
child.stderr.on('data', inspect);
child.on('error', (error) => finish(1, error.message));
child.on('exit', (code) => {
  if (!finished) finish(code || 1, `SaaS development server exited with code ${code}.`);
});

const overallTimer = setTimeout(
  () => finish(1, 'SaaS development server did not become healthy within 15 seconds.'),
  15_000,
);
