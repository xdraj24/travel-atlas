import { spawn } from 'node:child_process';
import process from 'node:process';

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
    });

    proc.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function main() {
  try {
    // Try bootstrap first (safe if DB already initialized)
    console.info('[bootstrap] Running directus bootstrap...');
    await runCommand('directus', ['bootstrap']);
  } catch (err) {
    console.warn('[bootstrap] Bootstrap skipped or already initialized');
  }

  console.info('[bootstrap] Starting Directus...');
  await runCommand('directus', ['start']);
}

main().catch((error) => {
  console.error('[bootstrap] Failed', error);
  process.exit(1);
});
