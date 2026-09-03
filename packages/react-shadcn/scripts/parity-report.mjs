// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Compares the exported API of an upstream component directory (packages/react/src/<Dir>) with the ported
// registry item and writes parity/<item>.md. Every removed or changed export must be explained in
// docs/migration/<item>.md.
//
//   node scripts/parity-report.mjs human-name-input [more items...]
//   node scripts/parity-report.mjs --all
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import ts from 'typescript';
import { items } from '../registry/items.mjs';
import { PACKAGE_ROOT, UPSTREAM_SRC } from './lib.mjs';

function sourceFiles(paths) {
  return paths.filter((p) => /\.tsx?$/.test(p) && !/\.(test|stories)\.tsx?$/.test(p) && !p.endsWith('.d.ts'));
}

function upstreamFiles(upstream) {
  const abs = join(UPSTREAM_SRC, upstream);
  if (!existsSync(abs)) {
    return [];
  }
  if (statSync(abs).isFile()) {
    return [abs];
  }
  return sourceFiles(readdirSync(abs).map((f) => join(abs, f)));
}

function hasExport(node) {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

// Returns Map<exportName, { kind, members?: Map<memberName, typeText> }>
function extractApi(files) {
  const api = new Map();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(
      basename(file),
      text,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    const membersOf = (node) => {
      const members = new Map();
      for (const m of node.members ?? []) {
        if ((ts.isPropertySignature(m) || ts.isMethodSignature(m)) && m.name) {
          const name = m.name.getText(sf) + (m.questionToken ? '?' : '');
          const fallback = ts.isMethodSignature(m) ? 'method' : 'any';
          members.set(name, m.type ? m.type.getText(sf).replace(/\s+/g, ' ') : fallback);
        }
      }
      return members;
    };
    sf.forEachChild((node) => {
      if (!hasExport(node)) {
        return;
      }
      if (ts.isInterfaceDeclaration(node)) {
        api.set(node.name.text, {
          kind: 'interface',
          members: membersOf(node),
          extends: node.heritageClauses?.map((h) => h.getText(sf).replace(/\s+/g, ' ')).join(' '),
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        const members = ts.isTypeLiteralNode(node.type) ? membersOf(node.type) : undefined;
        api.set(node.name.text, {
          kind: 'type',
          members,
          text: members ? undefined : node.type.getText(sf).replace(/\s+/g, ' '),
        });
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        api.set(node.name.text, {
          kind: 'function',
          params: node.parameters.map((p) => p.getText(sf).replace(/\s+/g, ' ')),
        });
      } else if (ts.isClassDeclaration(node) && node.name) {
        api.set(node.name.text, { kind: 'class' });
      } else if (ts.isEnumDeclaration(node)) {
        api.set(node.name.text, { kind: 'enum' });
      } else if (ts.isVariableStatement(node)) {
        for (const d of node.declarationList.declarations) {
          if (ts.isIdentifier(d.name)) {
            api.set(d.name.text, { kind: 'const' });
          }
        }
      }
    });
  }
  return api;
}

function report(item) {
  const upstream = extractApi(upstreamFiles(item.upstream));
  const ported = extractApi(item.files.map((f) => join(PACKAGE_ROOT, 'src', f)));
  const lines = [
    `# API parity: \`${item.name}\``,
    '',
    `Upstream: \`packages/react/src/${item.upstream}\` · Port: ${item.files.map((f) => `\`src/${f}\``).join(', ')}`,
    '',
  ];
  const removed = [...upstream.keys()].filter((k) => !ported.has(k));
  const added = [...ported.keys()].filter((k) => !upstream.has(k));
  const kept = [...upstream.keys()].filter((k) => ported.has(k));
  let deltas = removed.length + added.length;
  lines.push(
    `## Exports`,
    '',
    `| | names |`,
    `|---|---|`,
    `| kept (${kept.length}) | ${kept.map((k) => `\`${k}\``).join(', ') || '—'} |`,
    `| removed (${removed.length}) | ${removed.map((k) => `\`${k}\``).join(', ') || '—'} |`,
    `| added (${added.length}) | ${added.map((k) => `\`${k}\``).join(', ') || '—'} |`,
    ''
  );
  for (const k of kept) {
    const a = upstream.get(k);
    const b = ported.get(k);
    if (!a.members || !b.members) {
      if (a.extends !== b.extends && (a.extends || b.extends)) {
        lines.push(`### \`${k}\``, '', `extends changed: \`${a.extends ?? '—'}\` → \`${b.extends ?? '—'}\``, '');
        deltas++;
      }
      continue;
    }
    const removedMembers = [...a.members.keys()].filter((m) => !b.members.has(m));
    const addedMembers = [...b.members.keys()].filter((m) => !a.members.has(m));
    const changedMembers = [...a.members.keys()].filter(
      (m) => b.members.has(m) && a.members.get(m) !== b.members.get(m)
    );
    if (removedMembers.length || addedMembers.length || changedMembers.length || a.extends !== b.extends) {
      deltas += removedMembers.length + addedMembers.length + changedMembers.length;
      lines.push(`### \`${k}\``, '');
      if (a.extends !== b.extends && (a.extends || b.extends)) {
        lines.push(`- extends: \`${a.extends ?? '—'}\` → \`${b.extends ?? '—'}\``);
        deltas++;
      }
      for (const m of removedMembers) {
        lines.push(`- removed \`${m}: ${a.members.get(m)}\``);
      }
      for (const m of addedMembers) {
        lines.push(`- added \`${m}: ${b.members.get(m)}\``);
      }
      for (const m of changedMembers) {
        lines.push(`- changed \`${m}\`: \`${a.members.get(m)}\` → \`${b.members.get(m)}\``);
      }
      lines.push('');
    }
  }
  const migrationDoc = join(PACKAGE_ROOT, 'docs/migration', `${item.name}.md`);
  lines.push(
    `## Verdict`,
    '',
    deltas === 0
      ? 'No API deltas.'
      : `${deltas} delta(s). ${existsSync(migrationDoc) ? `Documented in \`docs/migration/${item.name}.md\`.` : `**Missing \`docs/migration/${item.name}.md\`.**`}`,
    ''
  );
  mkdirSync(join(PACKAGE_ROOT, 'parity'), { recursive: true });
  writeFileSync(join(PACKAGE_ROOT, 'parity', `${item.name}.md`), `${lines.join('\n')}\n`);
  return { deltas, documented: deltas === 0 || existsSync(migrationDoc) };
}

const args = process.argv.slice(2);
const selected = args.includes('--all') ? items.filter((i) => i.upstream) : items.filter((i) => args.includes(i.name));
if (!selected.length) {
  console.error('usage: node scripts/parity-report.mjs <item> [...] | --all');
  process.exit(2);
}
let undocumented = 0;
for (const item of selected) {
  const r = report(item);
  console.log(`${item.name}: ${r.deltas} delta(s)${r.documented ? '' : ' — UNDOCUMENTED'}`);
  if (!r.documented) {
    undocumented++;
  }
}
process.exit(undocumented ? 1 : 0);
