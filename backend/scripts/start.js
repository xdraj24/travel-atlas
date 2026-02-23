import { spawn } from 'node:child_process';
import process from 'node:process';

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
    });

    proc.on('error', (error) => {
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function prepareRuntimeEnv() {
  if (!process.env.DB_CLIENT) {
    process.env.DB_CLIENT = 'pg';
    console.warn('[bootstrap] DB_CLIENT not set, defaulting to "pg"');
  }

  if (!process.env.DB_CONNECTION_STRING && process.env.DATABASE_URL) {
    process.env.DB_CONNECTION_STRING = process.env.DATABASE_URL;
    console.info('[bootstrap] Using DATABASE_URL as DB_CONNECTION_STRING');
  }
}

function shouldBootstrap() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

async function main() {
  prepareRuntimeEnv();

  try {
    // Run bootstrap only when admin credentials are explicitly provided.
    // This avoids non-interactive startup hangs/misconfiguration loops on platforms
    // where only runtime DB URLs are injected.
    if (shouldBootstrap()) {
      console.info('[bootstrap] Running directus bootstrap...');
      await runCommand('directus', ['bootstrap']);
    } else {
      console.info('[bootstrap] Skipping bootstrap (ADMIN_EMAIL/ADMIN_PASSWORD not set)');
    }
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
