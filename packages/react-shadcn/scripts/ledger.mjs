// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Evidence ledger for the port. One row per upstream directory in packages/react/src.
//
//   node scripts/ledger.mjs update <item> [...]      run L1 (unit tests), L2 (stories), L5 (parity), L6 (hygiene)
//                                                     for the given registry items and record the results
//   node scripts/ledger.mjs update --all
//   node scripts/ledger.mjs render                    regenerate MIGRATION_STATUS.md from ledger.json
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { items } from '../registry/items.mjs';
import { PACKAGE_ROOT, UPSTREAM_SRC, readJson } from './lib.mjs';

const LEDGER = join(PACKAGE_ROOT, 'ledger.json');
const STATUS = join(PACKAGE_ROOT, 'MIGRATION_STATUS.md');
const INFRA_DIRS = new Set(['stories', 'test-mocks', 'test-utils']);
const DEFERRED_V2 = new Set(['AppShell', 'NotificationIcon', 'auth', 'GoogleButton', 'chat']);
const env = { ...process.env, PATH: `${join(PACKAGE_ROOT, '../../node_modules/.bin')}:${process.env.PATH}` };

function loadLedger() {
  return existsSync(LEDGER) ? readJson(LEDGER) : { items: {} };
}

function upstreamDirOf(item) {
  if (!item.upstream) {
    return undefined;
  }
  const abs = join(UPSTREAM_SRC, item.upstream);
  if (statSync(abs).isDirectory()) {
    return item.upstream;
  }
  const parent = dirname(item.upstream);
  return parent === '.' ? 'utils' : parent;
}

function countTestCases(files) {
  let n = 0;
  for (const f of files) {
    n += (readFileSync(f, 'utf8').match(/^\s*(test|it)(\.each\([^)]*\))?\(/gm) ?? []).length;
  }
  return n;
}

function upstreamTestFiles(item) {
  const abs = join(UPSTREAM_SRC, item.upstream);
  if (statSync(abs).isFile()) {
    const candidate = abs.replace(/\.tsx?$/, (ext) => `.test${ext}`);
    return existsSync(candidate) ? [candidate] : [];
  }
  return readdirSync(abs)
    .filter((f) => /\.test\.tsx?$/.test(f))
    .map((f) => join(abs, f));
}

function upstreamStoryCount(item) {
  const abs = join(UPSTREAM_SRC, item.upstream);
  const files = statSync(abs).isFile()
    ? [abs.replace(/\.tsx?$/, '.stories.tsx')].filter(existsSync)
    : readdirSync(abs)
        .filter((f) => /\.stories\.tsx?$/.test(f))
        .map((f) => join(abs, f));
  let n = 0;
  for (const f of files) {
    n += [...readFileSync(f, 'utf8').matchAll(/^export\s+(?:const|function)\s+([A-Za-z0-9_]+)/gm)].filter(
      (m) => m[1] !== 'default'
    ).length;
  }
  return n;
}

// Runs one vitest project once and returns Map<absolute test file path, { passing, failing, skipped[], total }>.
function runVitest(project, filters) {
  const byFile = new Map();
  if (!filters.length) {
    return byFile;
  }
  const out = join(mkdtempSync(join(tmpdir(), 'ledger-')), 'results.json');
  spawnSync('npx', ['vitest', 'run', '--project', project, '--reporter=json', `--outputFile=${out}`, ...filters], {
    cwd: PACKAGE_ROOT,
    env,
    stdio: 'ignore',
  });
  if (!existsSync(out)) {
    return byFile;
  }
  for (const file of readJson(out).testResults ?? []) {
    const result = { passing: 0, failing: 0, skipped: [], total: 0 };
    for (const t of file.assertionResults ?? []) {
      result.total++;
      if (t.status === 'passed') {
        result.passing++;
      } else if (t.status === 'failed') {
        result.failing++;
      } else {
        result.skipped.push(t.fullName ?? t.title);
      }
    }
    byFile.set(file.name, result);
  }
  return byFile;
}

function sumResults(byFile, files) {
  const sum = { passing: 0, failing: 0, skipped: [], total: 0 };
  for (const f of files) {
    const r = byFile.get(f);
    if (r) {
      sum.passing += r.passing;
      sum.failing += r.failing;
      sum.skipped.push(...r.skipped);
      sum.total += r.total;
    }
  }
  return sum;
}

function parity(item) {
  if (!item.upstream) {
    return { deltas: 0, documented: true };
  }
  const r = spawnSync('node', ['scripts/parity-report.mjs', item.name], { cwd: PACKAGE_ROOT, env, encoding: 'utf8' });
  const m = /(\d+) delta\(s\)( — UNDOCUMENTED)?/.exec(r.stdout ?? '');
  return { deltas: m ? Number(m[1]) : null, documented: m ? !m[2] : false };
}

function hygiene() {
  const a = spawnSync('node', ['scripts/check-hygiene.mjs', 'mantine'], { cwd: PACKAGE_ROOT, env });
  const b = spawnSync('node', ['scripts/check-hygiene.mjs', 'css-modules'], { cwd: PACKAGE_ROOT, env });
  return a.status === 0 && b.status === 0;
}

function update(selected) {
  const ledger = loadLedger();
  const hygieneOk = hygiene();
  const testFilesOf = (item) =>
    item.files
      .map((f) =>
        join(
          PACKAGE_ROOT,
          'src',
          f.replace(/\.tsx?$/, (ext) => `.test${ext}`)
        )
      )
      .filter(existsSync);
  const storyFilesOf = (item) =>
    item.files.map((f) => join(PACKAGE_ROOT, 'src', f.replace(/\.tsx?$/, '.stories.tsx'))).filter(existsSync);
  const unitByFile = runVitest(
    'unit',
    selected.flatMap((item) => testFilesOf(item).map((f) => `/${basename(f)}`))
  );
  const storiesByFile = runVitest(
    'storybook',
    selected.flatMap((item) => storyFilesOf(item).map((f) => `/${basename(f)}`))
  );
  for (const item of selected) {
    const unit = sumResults(unitByFile, testFilesOf(item));
    const stories = sumResults(storiesByFile, storyFilesOf(item));
    const upstreamTests = item.upstream ? countTestCases(upstreamTestFiles(item)) : 0;
    const p = parity(item);
    const row = {
      upstream: item.upstream ?? null,
      upstreamDir: upstreamDirOf(item) ?? null,
      tests: {
        upstream: upstreamTests,
        ported: unit.total,
        passing: unit.passing,
        failing: unit.failing,
        skipped: unit.skipped,
      },
      stories: {
        upstream: item.upstream ? upstreamStoryCount(item) : 0,
        ported: stories.total,
        passing: stories.passing,
      },
      parity: p,
      hygiene: hygieneOk,
      registry: { builds: true },
      visual: ledger.items[item.name]?.visual ?? { reviewedBy: null, notes: null },
      updatedAt: new Date().toISOString(),
    };
    const testsOk = row.tests.upstream === 0 || row.tests.passing >= Math.ceil(row.tests.upstream * 0.95);
    const storiesOk = row.stories.ported >= row.stories.upstream && row.stories.passing === row.stories.ported;
    row.status = testsOk && storiesOk && p.documented && hygieneOk && unit.failing === 0 ? 'done' : 'in-progress';
    ledger.items[item.name] = row;
    console.log(
      `${item.name}: tests ${row.tests.passing}/${row.tests.upstream} upstream (${unit.failing} failing, ${unit.skipped.length} skipped), stories ${row.stories.passing}/${row.stories.ported}, parity ${p.deltas} delta(s)${p.documented ? '' : ' undocumented'}, ${row.status}`
    );
  }
  ledger.updatedAt = new Date().toISOString();
  writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`);
}

function render() {
  const ledger = loadLedger();
  const dirs = readdirSync(UPSTREAM_SRC).filter(
    (d) => statSync(join(UPSTREAM_SRC, d)).isDirectory() && !INFRA_DIRS.has(d)
  );
  const byDir = new Map();
  for (const [name, row] of Object.entries(ledger.items)) {
    const dir = row.upstreamDir ?? '(none)';
    if (!byDir.has(dir)) {
      byDir.set(dir, []);
    }
    byDir.get(dir).push({ name, ...row });
  }
  const upstreamVersion = readJson(join(UPSTREAM_SRC, '../package.json')).version;
  const lines = [
    '# Migration status',
    '',
    `Generated by \`node scripts/ledger.mjs render\` from \`ledger.json\` (${ledger.updatedAt ?? 'never updated'}). Upstream: \`@medplum/react@${upstreamVersion}\` (\`packages/react/src\`).`,
    '',
  ];
  let done = 0;
  let testsPassing = 0;
  let storiesPassing = 0;
  const rows = [];
  for (const dir of dirs.sort((a, b) => a.localeCompare(b))) {
    const entries = byDir.get(dir) ?? [];
    if (DEFERRED_V2.has(dir)) {
      rows.push(`| ${dir} | — | deferred-v2 | | | | | |`);
      continue;
    }
    if (!entries.length) {
      rows.push(`| ${dir} | — | todo | | | | | |`);
      continue;
    }
    const statuses = new Set(entries.map((e) => e.status));
    const status = statuses.size === 1 ? [...statuses][0] : 'in-progress';
    const t = entries.reduce(
      (a, e) => ({ p: a.p + e.tests.passing, u: Math.max(a.u, e.tests.upstream), s: a.s + e.tests.skipped.length }),
      { p: 0, u: 0, s: 0 }
    );
    const s = entries.reduce((a, e) => ({ p: a.p + e.stories.passing, u: Math.max(a.u, e.stories.upstream) }), {
      p: 0,
      u: 0,
    });
    const parityText = entries.map((e) => `${e.parity.deltas ?? '?'}${e.parity.documented ? '' : '!'}`).join('/');
    if (status === 'done') {
      done++;
    }
    testsPassing += t.p;
    storiesPassing += s.p;
    rows.push(
      `| ${dir} | ${entries.map((e) => `\`${e.name}\``).join(', ')} | ${status} | ${t.p}/${t.u}${t.s ? ` (${t.s} skipped)` : ''} | ${s.p}/${s.u} | ${parityText} | ${entries.every((e) => e.hygiene) ? 'ok' : 'FAIL'} | ${entries.map((e) => e.visual?.reviewedBy ?? '—').join('/')} |`
    );
  }
  const v1Dirs = dirs.filter((d) => !DEFERRED_V2.has(d)).length;
  lines.push(
    `**v1 progress:** ${done}/${v1Dirs} upstream directories done · ${testsPassing} upstream test cases passing across ported items · ${storiesPassing} stories passing.`,
    ''
  );
  lines.push(
    '| Upstream dir | Items | Status | Tests (passing/upstream) | Stories (passing/upstream) | Parity deltas | Hygiene | Visual review |',
    '|---|---|---|---|---|---|---|---|',
    ...rows,
    ''
  );
  lines.push(
    'Legend: `todo` not started · `in-progress` some layer red · `done` L1 ≥ 95% and no failures, L2 all ported stories render, L5 documented, L6 clean · `deferred-v2` shell/auth/chat, out of v1 scope. A `!` after a parity count means an undocumented delta.',
    ''
  );
  writeFileSync(STATUS, lines.join('\n'));
  console.log(`Wrote MIGRATION_STATUS.md (${done}/${v1Dirs} done).`);
}

const [command, ...rest] = process.argv.slice(2);
if (command === 'update') {
  const selected = rest.includes('--all') ? items : items.filter((i) => rest.includes(i.name));
  if (!selected.length) {
    console.error('usage: node scripts/ledger.mjs update <item> [...] | --all');
    process.exit(2);
  }
  update(selected);
  render();
} else if (command === 'render') {
  render();
} else {
  console.error('usage: node scripts/ledger.mjs <update|render> ...');
  process.exit(2);
}
