// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Copies upstream files from packages/react/src into this package with the Apache §4(b) notice and
// rewritten import paths, so an executor starts from an exact copy and only touches Mantine usage.
//
//   node scripts/port.mjs HumanNameInput                 -> src/components/medplum/human-name-input*.{tsx}
//   node scripts/port.mjs utils/outcomes.ts --to lib/medplum
//   node scripts/port.mjs QuestionnaireForm --to components/medplum/questionnaire-form
//
// Existing destination files are never overwritten unless --force is passed.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { kebab, kebabFileName, noticeLine, PACKAGE_ROOT, SPDX_HEADER, UPSTREAM_SRC } from './lib.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const toIndex = args.indexOf('--to');
const target = toIndex >= 0 ? args[toIndex + 1] : 'components/medplum';
const sources = args.filter((a, i) => !a.startsWith('--') && (toIndex < 0 || i !== toIndex + 1));

if (sources.length === 0) {
  console.error('usage: node scripts/port.mjs <UpstreamDir|path/to/file.ts> [...] [--to <dir under src>] [--force]');
  process.exit(1);
}

const LIB_DIRS = new Set(['utils']);

function rewriteSpecifier(spec, upstreamRel) {
  // Relative imports only; everything else (react, @medplum/*, @mantine/*) is left for the executor.
  if (!spec.startsWith('.')) {
    return spec;
  }
  const fromDir = dirname(upstreamRel);
  const resolved = join(fromDir, spec).replace(/\\/g, '/');
  const parts = resolved.split('/');
  const dir = parts[0];
  const file = parts.slice(1).join('/');
  if (LIB_DIRS.has(dir)) {
    return `@/lib/medplum/${kebab(basename(file))}`;
  }
  if (dir === 'test-utils') {
    return `@/test/${kebab(basename(file))}`;
  }
  if (dir === 'test-mocks') {
    return `@/test/mocks/${kebab(basename(file))}`;
  }
  if (dir === 'stories') {
    return `@/stories/${kebab(basename(file))}`;
  }
  if (dir === 'constants') {
    return '@/lib/medplum/constants';
  }
  if (parts.length === 1) {
    return `@/components/medplum/${kebab(dir)}`;
  }
  // ../Dir/File or ./File within the same component dir.
  const targetDir = parts.length > 2 ? `${kebab(dir)}/${parts.slice(1, -1).map(kebab).join('/')}` : kebab(dir);
  const base = kebab(basename(file));
  if (base === kebab(dir)) {
    return `@/components/medplum/${base}`;
  }
  // Multi-file components keep their folder (chat/, auth/, PatientSummary/, QuestionnaireForm/...).
  const multiFile =
    readdirSync(join(UPSTREAM_SRC, dir)).filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f)).length >
    2;
  return multiFile ? `@/components/medplum/${targetDir}/${base}` : `@/components/medplum/${base}`;
}

function transform(source, upstreamRel) {
  let out = source;
  const headerRe = new RegExp(`^${SPDX_HEADER.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\n')}\\n`);
  if (headerRe.test(out)) {
    out = out.replace(headerRe, `${SPDX_HEADER.join('\n')}\n${noticeLine(upstreamRel)}\n`);
  } else {
    out = `${SPDX_HEADER.join('\n')}\n${noticeLine(upstreamRel)}\n${out}`;
  }
  out = out.replace(
    /(from\s+|import\s*\(\s*|vi\.mock\(\s*)(['"])([^'"]+)\2/g,
    (m, pre, q, spec) => `${pre}${q}${rewriteSpecifier(spec, upstreamRel)}${q}`
  );
  out = out.replace(
    /(export\s+\*\s+from\s+)(['"])([^'"]+)\2/g,
    (m, pre, q, spec) => `${pre}${q}${rewriteSpecifier(spec, upstreamRel)}${q}`
  );
  return out;
}

function portFile(upstreamRel, destDir) {
  const src = join(UPSTREAM_SRC, upstreamRel);
  const dest = join(PACKAGE_ROOT, 'src', destDir, kebabFileName(basename(upstreamRel)));
  if (existsSync(dest) && !force) {
    console.log(`skip (exists) ${relative(PACKAGE_ROOT, dest)}`);
    return;
  }
  if (upstreamRel.endsWith('.css')) {
    console.log(`skip (css module must become Tailwind) ${upstreamRel}`);
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, transform(readFileSync(src, 'utf8'), upstreamRel));
  console.log(`ported ${upstreamRel} -> ${relative(PACKAGE_ROOT, dest)}`);
}

for (const source of sources) {
  const abs = join(UPSTREAM_SRC, source);
  if (!existsSync(abs)) {
    console.error(`not found: ${abs}`);
    process.exit(1);
  }
  if (statSync(abs).isDirectory()) {
    for (const f of readdirSync(abs)) {
      if (statSync(join(abs, f)).isDirectory()) {
        continue;
      }
      portFile(`${source}/${f}`, target);
    }
  } else {
    portFile(source, target);
  }
}
