# Work-unit checklist (executors)

You are porting one work unit (a set of `packages/react/src/<Dir>` directories) from Mantine to shadcn/ui inside `packages/react-shadcn` of this repo. Other executors are working on other directories in the same checkout at the same time, so stay inside your files.

## Ground rules

- Run every command from `packages/react-shadcn` after `export PATH=$HOME/.nvm/versions/node/v22.22.2/bin:$PATH`.
- Read `docs/porting-rules.md` and `docs/translation-guide.md` first; they are binding. `docs/behavior-contracts.md` has the behavior contract for every complex component — read your section before porting.
- Study the golden example (`src/components/medplum/human-name-input.tsx`, `.test.tsx`, `.stories.tsx`) and the composition references (`form-section.tsx`, `panel.tsx`, `modal.tsx`).
- **Never** run `npm install`, `git`, `storybook build`, `npm run registry:build`, or `npm run ledger:update`. **Never** edit `registry/items.mjs`, `registry/items/core.mjs`, `ledger.json`, `MIGRATION_STATUS.md`, `registry.json`, `docs/translation-guide.md`, `docs/porting-rules.md`, anything under `src/components/ui/` (vendored) or any file that belongs to another work unit. Do not touch `packages/react/src`.
- Conventions: two-line SPDX header on every new file (ESLint enforces it); ported files keep the header plus the notice line `port.mjs` inserts. `@/` imports only (`@/components/ui/*`, `@/components/medplum/*`, `@/lib/medplum/*`, `@/hooks/medplum/*`, `@/lib/utils`). `import type` for types, `ComponentProps` from `'react'` (never the `React.` namespace), single quotes, semicolons, Prettier 120 cols. `@tabler/icons-react` for icons. No `radix-ui`/`@base-ui/react`/`cmdk` imports outside `src/components/ui`. No code comments beyond what upstream had. No new behavior props.

## Steps per upstream directory

1. `node scripts/port.mjs <Dir>` copies component, tests and stories into `src/components/medplum/` (kebab-case) with rewritten imports. Multi-file directories: `node scripts/port.mjs <Dir> --to components/medplum/<kebab-dir>`. Never add `index.ts` barrels: consumers install the listed files only, so every import names the file (`@/components/medplum/form/form`, not `@/components/medplum/form`).
2. Run the ported test file first: `npx vitest run --project unit /<kebab>.test.` — it must fail because of Mantine imports, then pass.
3. Port the component: keep all logic (state, effects, callbacks, helpers) byte-for-byte; replace Mantine JSX with the recipes in the translation guide; delete CSS modules and express them with Tailwind; apply the composition rule to presentational props.
4. Tests: allowed edits are the render import (done), replacing Mantine-DOM queries with helpers in `src/test/`, `vi.mock` paths, and rewriting a _render call_ to a composed API. Assertions never change. If an assertion is Mantine-DOM-only, `test.skip('<name> (Mantine-specific: <reason>)', ...)`.
5. Stories: keep `title` and every export name; swap imports and Mantine JSX. If a story needs a component from a later work unit, keep the story file but mark that story with a `// TODO(wu-XX)`-free approach: skip porting _that story export only_ by leaving it out and listing it in your report (the ledger counts upstream stories).
6. Verify: `npx vitest run --project unit /<kebab>.` · `npx vitest run --project storybook /<kebab>.stories.` · `npx tsc --noEmit -p tsconfig.json` · `npx eslint src/components/medplum/<kebab>*` · `npx prettier --write <your files>` · `node scripts/parity-report.mjs <item>` (after step 7) · `node scripts/upstream-diff.mjs <item>` (expect only JSX hunks) · `node scripts/check-hygiene.mjs mantine`.
7. Register the items: create `registry/items/wu-XX.mjs` exporting `items` with the same shape as `registry/items/core.mjs` (name, title, description, files relative to `src/`, `upstream: '<Dir>'` or `'<Dir>/<File>.ts'`, categories). One item per upstream component; multi-file directories are one item listing every file (the entry first). Do not import it anywhere — the orchestrator wires it.
8. If `parity-report` shows deltas, write `docs/migration/<item>.md` mapping every removed/changed prop to the new API.

## Report

Finish with a table: item · upstream test cases passing/total (and each skip with its reason) · stories ported/upstream (missing ones named) · parity deltas documented (y/n) · anything you could not do and why. Paste the tail of the unit, storybook, tsc and eslint runs.
