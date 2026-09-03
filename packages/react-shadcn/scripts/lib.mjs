// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');
export const UPSTREAM_SRC = join(REPO_ROOT, 'packages/react/src');
export const UPSTREAM_VERSION = JSON.parse(
  readFileSync(join(REPO_ROOT, 'packages/react/package.json'), 'utf8')
).version;

export const SPDX_HEADER = [
  '// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors',
  '// SPDX-License-Identifier: Apache-2.0',
];

export function noticeLine(upstreamRelPath) {
  return `// Modified from @medplum/react ${UPSTREAM_VERSION} packages/react/src/${upstreamRelPath} for @medplum/react-shadcn (Apache-2.0 §4(b) notice)`;
}

export function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/\./g, '-')
    .toLowerCase();
}

// Upstream file name -> registry file name. Keeps .test/.stories suffixes, maps ".utils" to "-utils".
export function kebabFileName(fileName) {
  const m = /^(.*?)((?:\.test|\.stories)?\.(?:tsx?|css))$/.exec(fileName);
  if (!m) {
    return kebab(fileName);
  }
  return kebab(m[1]) + m[2];
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function fileExists(path) {
  return existsSync(path);
}
