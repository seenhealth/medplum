// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Generates the repository-root registry.json (GitHub-registry mode: `shadcn add seenhealth/medplum/<item>`).
//
//   node scripts/build-registry.mjs            write registry.json
//   node scripts/build-registry.mjs --check    exit 1 if registry.json is stale
//   node scripts/build-registry.mjs --static   also run `shadcn build` into public/r for hosted-namespace mode
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { REPO_ROOT } from './lib.mjs';
import { buildRegistry } from './registry-lib.mjs';

const registryPath = join(REPO_ROOT, 'registry.json');
const prettierConfig = (await resolveConfig(join(REPO_ROOT, 'registry.json'))) ?? {};
const next = await format(JSON.stringify(buildRegistry()), { ...prettierConfig, filepath: 'registry.json' });

if (process.argv.includes('--check')) {
  const current = existsSync(registryPath) ? readFileSync(registryPath, 'utf8') : '';
  if (current !== next) {
    console.error('registry.json is stale. Run `npm run registry:build` in packages/react-shadcn.');
    process.exit(1);
  }
  console.log(`registry.json is up to date (${JSON.parse(next).items.length} items).`);
} else {
  writeFileSync(registryPath, next);
  console.log(`Wrote ${relative(process.cwd(), registryPath)} (${JSON.parse(next).items.length} items).`);
}

if (process.argv.includes('--static')) {
  execFileSync('npx', ['-y', 'shadcn@latest', 'build', 'registry.json', '-o', 'packages/react-shadcn/public/r'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
}
