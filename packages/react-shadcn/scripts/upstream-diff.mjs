// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Two uses:
//   node scripts/upstream-diff.mjs <item>                 show how the port's logic differs from packages/react/src
//                                                         (imports/className/JSX noise stripped; expect no logic hunks)
//   node scripts/upstream-diff.mjs <old-sha> <new-sha>    list upstream files changed between two medplum commits and
//                                                         the registry items they map to (for the sync procedure)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { items } from '../registry/items.mjs';
import { PACKAGE_ROOT, REPO_ROOT, UPSTREAM_SRC, kebabFileName } from './lib.mjs';

const args = process.argv.slice(2);

function normalize(text) {
  return text
    .split('\n')
    .filter((l) => !/^\s*(import|export \* from|\/\/ SPDX|\/\/ Modified from)/.test(l))
    .map((l) => l.replace(/\s*(className|class)=\{?["'`][^"'`]*["'`]\}?/g, '').replace(/\s+data-slot="[^"]*"/g, ''))
    .join('\n');
}

if (args.length === 2 && /^[0-9a-f]{7,40}$/i.test(args[0]) && /^[0-9a-f]{7,40}$/i.test(args[1])) {
  const r = spawnSync('git', ['diff', '--name-only', args[0], args[1], '--', 'packages/react/src'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const byDir = new Map();
  for (const f of r.stdout.split('\n').filter(Boolean)) {
    const rel = relative('packages/react/src', f);
    const dir = rel.includes('/') ? rel.split('/')[0] : rel;
    if (!byDir.has(dir)) {
      byDir.set(dir, []);
    }
    byDir.get(dir).push(rel);
  }
  for (const [dir, files] of byDir) {
    const owners = items
      .filter((i) => i.upstream && (i.upstream === dir || i.upstream.startsWith(`${dir}/`)))
      .map((i) => i.name);
    console.log(`${dir}: ${files.length} file(s) → ${owners.length ? owners.join(', ') : 'not ported yet'}`);
    for (const f of files) {
      console.log(`  ${f}`);
    }
  }
  process.exit(0);
}

const item = items.find((i) => i.name === args[0]);
if (!item?.upstream) {
  console.error('usage: node scripts/upstream-diff.mjs <item> | <old-sha> <new-sha>');
  process.exit(2);
}
const upstreamAbs = join(UPSTREAM_SRC, item.upstream);
const upstreamFiles = statSync(upstreamAbs).isDirectory()
  ? readdirSync(upstreamAbs)
      .filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f))
      .map((f) => join(upstreamAbs, f))
  : [upstreamAbs];
const tmp = mkdtempSync(join(tmpdir(), 'upstream-diff-'));
let status = 0;
for (const up of upstreamFiles) {
  const portedName = kebabFileName(basename(up));
  const ported = item.files.map((f) => join(PACKAGE_ROOT, 'src', f)).find((f) => f.endsWith(`/${portedName}`));
  if (!ported || !existsSync(ported)) {
    console.log(`(no ported counterpart for ${relative(REPO_ROOT, up)})`);
    continue;
  }
  const a = normalize(readFileSync(up, 'utf8'));
  const b = normalize(readFileSync(ported, 'utf8'));
  if (a === b) {
    console.log(`${relative(REPO_ROOT, up)}: identical after stripping imports/classNames`);
    continue;
  }
  status = 1;
  writeFileSync(join(tmp, 'a'), a);
  writeFileSync(join(tmp, 'b'), b);
  const d = spawnSync(
    'diff',
    ['-u', '--label', relative(REPO_ROOT, up), '--label', relative(REPO_ROOT, ported), join(tmp, 'a'), join(tmp, 'b')],
    { encoding: 'utf8' }
  );
  console.log(d.stdout);
}
rmSync(tmp, { recursive: true, force: true });
process.exit(status);
