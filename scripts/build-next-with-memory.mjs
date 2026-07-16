#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const nextBin = resolve(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

const parsedHeapMb = Number.parseInt(process.env.NEXT_BUILD_HEAP_MB || '8192', 10);
const heapMb = Number.isFinite(parsedHeapMb) && parsedHeapMb > 0 ? parsedHeapMb : 8192;

// Keep local builds from spawning multiple memory-heavy page-data workers.
const buildWorkers = process.env.NEXT_BUILD_WORKERS || '1';
const useSystemCa = process.env.NEXT_BUILD_USE_SYSTEM_CA !== 'false';

console.log(
  `[build] Running next build with Node heap ${heapMb}MB, NEXT_BUILD_WORKERS=${buildWorkers}, system CA=${useSystemCa}`
);

const nodeArgs = [];
if (useSystemCa) {
  nodeArgs.push('--use-system-ca');
}
nodeArgs.push(`--max-old-space-size=${heapMb}`, nextBin, 'build', '--webpack');

const result = spawnSync(
  process.execPath,
  nodeArgs,
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_BUILD_WORKERS: buildWorkers,
    },
  }
);

if (result.error) {
  console.error('[build] Failed to start next build:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
