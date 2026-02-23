import { spawn } from 'node:child_process';
import process from 'node:process';

import { runResetAndSeed } from './reset-and-seed.js';

function isTrue(value) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

async function main() {
  if (isTrue(process.env.RESET_AND_SEED_ON_BOOT)) {
    console.info('[bootstrap] RESET_AND_SEED_ON_BOOT=true -> resetting custom tables');
    await runResetAndSeed();
  }

  const directusProcess = spawn('directus', ['start'], {
    stdio: 'inherit',
    env: process.env,
  });

  directusProcess.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error('[bootstrap] Failed to start Directus', error);
  process.exit(1);
});
