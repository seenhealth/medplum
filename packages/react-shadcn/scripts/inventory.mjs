// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { UPSTREAM_SRC } from './lib.mjs';

const ROOT = process.env.MEDPLUM_REACT_SRC ?? UPSTREAM_SRC;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

function parseImports(src, pkg) {
  const names = new Set();
  const re = new RegExp(`import\\s+(type\\s+)?\\{([^}]*)\\}\\s+from\\s+['"]${pkg.replace('/', '\\/')}['"]`, 'g');
  let m;
  while ((m = re.exec(src))) {
    for (const raw of m[2].split(',')) {
      const name = raw
        .trim()
        .split(/\s+as\s+/)[0]
        .replace(/^type\s+/, '')
        .trim();
      if (name) {
        names.add(name);
      }
    }
  }
  return names;
}

const rows = [];
const mantineTotals = new Map();
for (const dir of readdirSync(ROOT)) {
  const full = join(ROOT, dir);
  if (!statSync(full).isDirectory()) {
    continue;
  }
  const files = walk(full);
  const src = files.filter((f) => /\.(ts|tsx)$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f) && !/\.d\.ts$/.test(f));
  const stories = files.filter((f) => /\.stories\.tsx?$/.test(f));
  const tests = files.filter((f) => /\.test\.tsx?$/.test(f));
  const css = files.filter((f) => /\.css$/.test(f));
  let loc = 0;
  let testLoc = 0;
  const mantineCore = new Set();
  const mantineHooks = new Set();
  const mantineOther = new Set();
  const reactHooks = new Set();
  const otherDeps = new Set();
  for (const f of src) {
    const s = readFileSync(f, 'utf8');
    loc += s.split('\n').length;
    for (const n of parseImports(s, '@mantine/core')) {
      mantineCore.add(n);
    }
    for (const n of parseImports(s, '@mantine/hooks')) {
      mantineHooks.add(n);
    }
    for (const pkg of ['@mantine/notifications', '@mantine/spotlight', '@mantine/dates', '@mantine/dropzone']) {
      for (const n of parseImports(s, pkg)) {
        mantineOther.add(`${pkg.split('/')[1]}:${n}`);
      }
    }
    for (const n of parseImports(s, '@medplum/react-hooks')) {
      reactHooks.add(n);
    }
    for (const m of s.matchAll(/from\s+['"]([^'".][^'"]*)['"]/g)) {
      const p = m[1];
      if (
        p.startsWith('@mantine/') ||
        p.startsWith('@medplum/') ||
        p === 'react' ||
        p === 'react-dom' ||
        p.startsWith('react/')
      ) {
        continue;
      }
      otherDeps.add(p);
    }
  }
  for (const f of tests) {
    testLoc += readFileSync(f, 'utf8').split('\n').length;
  }
  for (const n of mantineCore) {
    mantineTotals.set(n, (mantineTotals.get(n) ?? 0) + 1);
  }
  rows.push({
    dir,
    srcFiles: src.length,
    loc,
    stories: stories.length,
    tests: tests.length,
    testLoc,
    css: css.length,
    mantineCore: [...mantineCore].sort(),
    mantineHooks: [...mantineHooks].sort(),
    mantineOther: [...mantineOther].sort(),
    reactHooks: [...reactHooks].sort(),
    otherDeps: [...otherDeps].sort(),
  });
}

rows.sort((a, b) => a.dir.localeCompare(b.dir));
const totals = rows.reduce(
  (acc, r) => ({
    loc: acc.loc + r.loc,
    testLoc: acc.testLoc + r.testLoc,
    stories: acc.stories + r.stories,
    tests: acc.tests + r.tests,
    css: acc.css + r.css,
  }),
  { loc: 0, testLoc: 0, stories: 0, tests: 0, css: 0 }
);

let md = `# @medplum/react inventory (upstream/main)\n\n`;
md += `Directories: ${rows.length}. Source LOC: ${totals.loc}. Test LOC: ${totals.testLoc}. Story files: ${totals.stories}. Test files: ${totals.tests}. CSS files: ${totals.css}.\n\n`;
md += `| Dir | src files | LOC | stories | tests | test LOC | css | @mantine/core | @mantine/hooks | other mantine | react-hooks | other deps |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const r of rows) {
  md += `| ${r.dir} | ${r.srcFiles} | ${r.loc} | ${r.stories} | ${r.tests} | ${r.testLoc} | ${r.css} | ${r.mantineCore.join(', ')} | ${r.mantineHooks.join(', ')} | ${r.mantineOther.join(', ')} | ${r.reactHooks.join(', ')} | ${r.otherDeps.join(', ')} |\n`;
}
md += `\n## Mantine core component usage (number of component dirs using it)\n\n| Mantine component | dirs |\n|---|---|\n`;
for (const [n, c] of [...mantineTotals.entries()].sort((a, b) => b[1] - a[1])) {
  md += `| ${n} | ${c} |\n`;
}

const noMantine = rows.filter(
  (r) => r.mantineCore.length === 0 && r.mantineHooks.length === 0 && r.mantineOther.length === 0
);
md += `\n## Dirs with zero Mantine imports (${noMantine.length})\n\n${noMantine.map((r) => r.dir).join(', ')}\n`;
const noStories = rows.filter((r) => r.stories === 0);
md += `\n## Dirs with no stories (${noStories.length})\n\n${noStories.map((r) => r.dir).join(', ')}\n`;
const noTests = rows.filter((r) => r.tests === 0);
md += `\n## Dirs with no tests (${noTests.length})\n\n${noTests.map((r) => r.dir).join(', ')}\n`;

process.stdout.write(md);
