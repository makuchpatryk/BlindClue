#!/usr/bin/env node
import { rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('..', import.meta.url));

const pathsToClean = [
  'node_modules',
  'packages/backend/node_modules',
  'packages/frontend/node_modules',
  'packages/shared/node_modules',
  'pnpm-lock.yaml',
  'packages/backend/dist',
  'packages/frontend/dist',
  '.pnpm-store',
];

console.log('🧹 Cleaning up...\n');

pathsToClean.forEach((path) => {
  const fullPath = join(__dirname, path);
  try {
    rmSync(fullPath, { recursive: true, force: true });
    console.log(`✓ Removed: ${path}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`✗ Failed to remove ${path}:`, err.message);
    }
  }
});

console.log('\n✨ Cleanup complete!');
console.log('Run "pnpm install" to reinstall dependencies.\n');
