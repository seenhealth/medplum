// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Builds the registry.json object from registry/items.mjs. Dependencies are derived from each file's
// imports so they cannot drift from the source.
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { items } from '../registry/items.mjs';
import { PACKAGE_ROOT, REPO_ROOT, UPSTREAM_VERSION, readJson } from './lib.mjs';

const GITHUB_PREFIX = 'seenhealth/medplum';
const pkg = readJson(join(PACKAGE_ROOT, 'package.json'));
const versions = { ...pkg.dependencies, ...pkg.devDependencies };
const customUi = new Set(
  items.flatMap((item) =>
    item.files.filter((f) => f.startsWith('components/ui/')).map((f) => f.replace(/^components\/ui\/|\.tsx?$/g, ''))
  )
);
const ourItemsByFile = new Map();
for (const item of items) {
  for (const f of item.files) {
    ourItemsByFile.set(f.replace(/\.tsx?$/, ''), item.name);
  }
}

function typeForFile(file) {
  if (file.startsWith('lib/')) {
    return 'registry:lib';
  }
  if (file.startsWith('hooks/')) {
    return 'registry:hook';
  }
  if (file.startsWith('components/ui/')) {
    return 'registry:ui';
  }
  return 'registry:component';
}

function targetForFile(file) {
  return file;
}

function npmDependency(specifier) {
  const name = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
  if (['react', 'react-dom', 'react-router'].includes(name)) {
    return undefined;
  }
  const version = versions[name];
  if (!version) {
    throw new Error(`No version for dependency ${name} in packages/react-shadcn/package.json`);
  }
  return name.startsWith('@medplum/')
    ? `${name}@${version}`
    : `${name}@${version.startsWith('^') ? version : `^${version}`}`;
}

function scanImports(file) {
  const source = readFileSync(join(PACKAGE_ROOT, 'src', file), 'utf8');
  const registryDependencies = new Set();
  const dependencies = new Set();
  for (const m of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const spec = m[1];
    if (spec.startsWith('@/')) {
      const rel = spec.slice(2);
      if (rel === 'lib/utils') {
        registryDependencies.add('utils');
      } else if (rel.startsWith('components/ui/')) {
        const name = rel.replace('components/ui/', '');
        registryDependencies.add(customUi.has(name) ? `${GITHUB_PREFIX}/${name}` : name);
      } else {
        const owner = ourItemsByFile.get(rel);
        if (!owner) {
          throw new Error(`${file} imports ${spec}, which no registry item provides`);
        }
        registryDependencies.add(`${GITHUB_PREFIX}/${owner}`);
      }
    } else if (!spec.startsWith('.') && !spec.startsWith('node:')) {
      const dep = npmDependency(spec);
      if (dep) {
        dependencies.add(dep);
      }
    }
  }
  return { registryDependencies, dependencies };
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

export function storyIdsFor(entryFile) {
  const storiesFile = join(PACKAGE_ROOT, 'src', entryFile.replace(/\.tsx?$/, '.stories.tsx'));
  if (!existsSync(storiesFile)) {
    return [];
  }
  const src = readFileSync(storiesFile, 'utf8');
  const title = src.match(/title:\s*['"]([^'"]+)['"]/)?.[1];
  if (!title) {
    return [];
  }
  return [...src.matchAll(/^export\s+(?:const|function)\s+([A-Za-z0-9_]+)/gm)]
    .map((m) => m[1])
    .filter((n) => n !== 'default')
    .map((n) => `${sanitize(title)}--${sanitize(startCase(n))}`);
}

export function buildRegistry() {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (seen.has(item.name)) {
      throw new Error(`Duplicate registry item name ${item.name}`);
    }
    seen.add(item.name);
    const registryDependencies = new Set();
    const dependencies = new Set();
    for (const f of item.files) {
      if (!existsSync(join(PACKAGE_ROOT, 'src', f))) {
        throw new Error(`${item.name}: missing file src/${f}`);
      }
      const scanned = scanImports(f);
      for (const d of scanned.registryDependencies) {
        if (d !== `${GITHUB_PREFIX}/${item.name}`) {
          registryDependencies.add(d);
        }
      }
      for (const d of scanned.dependencies) {
        dependencies.add(d);
      }
    }
    const entry = {
      name: item.name,
      type:
        item.files.length > 1 && typeForFile(item.files[0]) === 'registry:component'
          ? 'registry:block'
          : typeForFile(item.files[0]),
      title: item.title,
      description: item.description,
      files: item.files.map((f) => ({
        path: relative(REPO_ROOT, join(PACKAGE_ROOT, 'src', f)).replace(/\\/g, '/'),
        type: typeForFile(f),
        target: targetForFile(f),
      })),
    };
    if (dependencies.size) {
      entry.dependencies = [...dependencies].sort();
    }
    if (registryDependencies.size) {
      entry.registryDependencies = [...registryDependencies].sort();
    }
    if (item.categories?.length) {
      entry.categories = item.categories;
    }
    entry.docs = item.upstream
      ? `Derived from @medplum/react ${UPSTREAM_VERSION} (packages/react/src/${item.upstream}), Apache-2.0, Copyright Orangebot, Inc. and Medplum contributors; modified for shadcn/ui in packages/react-shadcn. Storybook reference: https://storybook.medplum.com`
      : 'Part of @medplum/react-shadcn (Apache-2.0).';
    entry.meta = {
      upstream: item.upstream ? `packages/react/src/${item.upstream}` : undefined,
      storyIds: storyIdsFor(item.files[0]),
    };
    out.push(entry);
  }
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'medplum-shadcn',
    homepage: 'https://github.com/seenhealth/medplum/tree/main/packages/react-shadcn',
    items: out,
  };
}
