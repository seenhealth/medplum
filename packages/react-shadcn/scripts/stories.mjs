// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { UPSTREAM_SRC } from './lib.mjs';

const ROOT = process.env.MEDPLUM_REACT_SRC ?? UPSTREAM_SRC;

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

const sanitize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
const startCase = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

const files = walk(ROOT).filter((f) => /\.stories\.tsx?$/.test(f));
let totalStories = 0;
let md = `# Upstream story -> Storybook ID matrix\n\nGenerated from ${files.length} story files under packages/react/src at upstream/main. IDs follow Storybook's toId(title, exportName). Verify at https://storybook.medplum.com/?path=/story/<id>\n\n| Component dir | Story file | Title | Export | Story ID |\n|---|---|---|---|---|\n`;
const perDir = new Map();
for (const f of files.sort()) {
  const src = readFileSync(f, 'utf8');
  const title = src.match(/title:\s*['"]([^'"]+)['"]/)?.[1];
  if (!title) {
    continue;
  }
  const exportsFound = [...src.matchAll(/^export\s+(?:const|function)\s+([A-Za-z0-9_]+)/gm)]
    .map((m) => m[1])
    .filter((n) => n !== 'default');
  const dir = relative(ROOT, f).split('/')[0];
  for (const ex of exportsFound) {
    const id = `${sanitize(title)}--${sanitize(startCase(ex))}`;
    md += `| ${dir} | ${relative(ROOT, f)} | ${title} | ${ex} | ${id} |\n`;
    totalStories++;
    perDir.set(dir, (perDir.get(dir) ?? 0) + 1);
  }
}
md = md.replace('Generated from', `Total stories: ${totalStories}. Generated from`);

// test case counts
const testFiles = walk(ROOT).filter((f) => /\.test\.tsx?$/.test(f));
const perDirTests = new Map();
let totalTests = 0;
for (const f of testFiles) {
  const src = readFileSync(f, 'utf8');
  const n = (src.match(/^\s*(test|it)(\.each\([^)]*\))?\(/gm) ?? []).length;
  const dir = relative(ROOT, f).split('/')[0];
  perDirTests.set(dir, (perDirTests.get(dir) ?? 0) + n);
  totalTests += n;
}
md += `\n# Test case baseline (count of test(/it( calls)\n\nTotal test cases: ${totalTests} across ${testFiles.length} files.\n\n| Component dir | test cases | stories |\n|---|---|---|\n`;
const dirs = new Set([...perDirTests.keys(), ...perDir.keys()]);
for (const d of [...dirs].sort()) {
  md += `| ${d} | ${perDirTests.get(d) ?? 0} | ${perDir.get(d) ?? 0} |\n`;
}
process.stdout.write(md);
