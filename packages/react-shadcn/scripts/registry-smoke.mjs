// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Installs registry items into a scratch Vite + React + Tailwind v4 app with the shadcn CLI and type-checks
// the result. Cross-item references are rewritten to local files so the smoke test does not need the
// GitHub registry to be published.
//
//   node scripts/registry-smoke.mjs human-name-input [...]
//   node scripts/registry-smoke.mjs --all
//   node scripts/registry-smoke.mjs --keep human-name-input     keep the scratch directory for inspection
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { items } from '../registry/items.mjs';
import { PACKAGE_ROOT, REPO_ROOT } from './lib.mjs';
import { buildRegistry } from './registry-lib.mjs';

const args = process.argv.slice(2);
const keep = args.includes('--keep');
const names = args.filter((a) => !a.startsWith('--'));
const selected = args.includes('--all') ? items : items.filter((i) => names.includes(i.name));
if (!selected.length) {
  console.error('usage: node scripts/registry-smoke.mjs [--keep] <item> [...] | --all');
  process.exit(2);
}

const scratch = mkdtempSync(join(tmpdir(), 'medplum-shadcn-smoke-'));
const app = join(scratch, 'app');
const run = (cmd, cmdArgs, cwd = app) => {
  const r = spawnSync(cmd, cmdArgs, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
    timeout: 600_000,
  });
  if (r.status !== 0) {
    console.error(`${cmd} ${cmdArgs.join(' ')} failed in ${cwd}\n${r.stdout}\n${r.stderr}`);
    process.exit(1);
  }
  return r.stdout;
};

// 1. Local registry: absolute file paths, cross-item references pointing at the built local JSON.
const registry = buildRegistry();
const localOut = join(scratch, 'r');
for (const item of registry.items) {
  item.files = item.files.map((f) => ({ ...f, path: join(REPO_ROOT, f.path) }));
  item.registryDependencies = item.registryDependencies?.map((d) =>
    d.startsWith('seenhealth/medplum/') ? join(localOut, `${d.split('/').pop()}.json`) : d
  );
}
const localRegistry = join(scratch, 'registry.json');
writeFileSync(localRegistry, JSON.stringify(registry, null, 2));
console.log(`building local registry into ${localOut}`);
run('npx', ['-y', 'shadcn@latest', 'build', localRegistry, '-o', localOut], REPO_ROOT);

// 2. Scratch Vite app.
mkdirSync(join(app, 'src'), { recursive: true });
const pkg = JSON.parse(execFileSync('cat', [join(PACKAGE_ROOT, 'package.json')], { encoding: 'utf8' }));
const v = { ...pkg.dependencies, ...pkg.devDependencies };
writeFileSync(
  join(app, 'package.json'),
  JSON.stringify(
    {
      name: 'medplum-shadcn-smoke',
      private: true,
      type: 'module',
      dependencies: { react: v.react, 'react-dom': v['react-dom'] },
      devDependencies: {
        '@tailwindcss/vite': v['@tailwindcss/vite'],
        '@types/react': v['@types/react'],
        '@types/react-dom': v['@types/react-dom'],
        '@vitejs/plugin-react': v['@vitejs/plugin-react'],
        tailwindcss: v.tailwindcss,
        typescript: v.typescript,
        vite: '^8.0.0',
      },
    },
    null,
    2
  )
);
writeFileSync(
  join(app, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'esnext',
        module: 'esnext',
        moduleResolution: 'bundler',
        lib: ['esnext', 'dom', 'dom.iterable'],
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        isolatedModules: true,
        paths: { '@/*': ['./src/*'] },
      },
      include: ['src'],
    },
    null,
    2
  )
);
writeFileSync(
  join(app, 'vite.config.ts'),
  `import tailwindcss from '@tailwindcss/vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'node:path';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },\n});\n`
);
writeFileSync(
  join(app, 'index.html'),
  '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n'
);
writeFileSync(join(app, 'src/index.css'), '@import "tailwindcss";\n');
writeFileSync(join(app, 'src/main.tsx'), 'export {};\n');
console.log(`installing scratch app in ${app}`);
run('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts']);
run('npx', ['-y', 'shadcn@latest', 'init', '-d', '-f', '--base', 'radix']);

// 3. Add the items and type-check.
for (const item of selected) {
  console.log(`adding ${item.name}`);
  run('npx', ['-y', 'shadcn@latest', 'add', '-y', '-o', join(localOut, `${item.name}.json`)]);
}
run('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json']);
console.log(`smoke passed for ${selected.map((i) => i.name).join(', ')}`);
if (keep) {
  console.log(`scratch kept at ${scratch}`);
} else {
  rmSync(scratch, { recursive: true, force: true });
}
