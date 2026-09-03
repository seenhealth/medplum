// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
//   node scripts/check-hygiene.mjs mantine       fail if any src file mentions @mantine or --mantine-
//   node scripts/check-hygiene.mjs css-modules   fail if any *.module.css exists under src
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PACKAGE_ROOT } from './lib.mjs';

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

const src = join(PACKAGE_ROOT, 'src');
const files = walk(src);
const mode = process.argv[2];
let offenders = [];

if (mode === 'mantine') {
  offenders = files.filter((f) => /\.(tsx?|css|mdx?)$/.test(f) && /@mantine|--mantine-/.test(readFileSync(f, 'utf8')));
} else if (mode === 'css-modules') {
  offenders = files.filter((f) => f.endsWith('.module.css'));
} else {
  console.error('usage: node scripts/check-hygiene.mjs <mantine|css-modules>');
  process.exit(2);
}

if (offenders.length) {
  console.error(`${mode} check failed:`);
  for (const f of offenders) {
    console.error(`  ${relative(PACKAGE_ROOT, f)}`);
  }
  process.exit(1);
}
console.log(`${mode} check passed (${files.length} files scanned).`);
