# @medplum/react-shadcn

`@medplum/react` components re-implemented on [shadcn/ui](https://ui.shadcn.com) (Radix, Tailwind v4) with the upstream logic and behavior kept intact, distributed as a **shadcn registry** rather than an npm package: you install a component's source into your project and own it.

Plan, decisions and status: `thoughts/shared/tasks/mantine-to-shadcn/` (plan) and [`MIGRATION_STATUS.md`](./MIGRATION_STATUS.md) (evidence ledger).

## Install a component

This repository is a [GitHub registry](https://ui.shadcn.com/docs/registry/github): the root `registry.json` lists every item and `shadcn add` reads the files straight from the repo (private repos work with `gh auth login` or `GH_TOKEN`).

```bash
pnpm dlx shadcn@latest add seenhealth/medplum/human-name-input
pnpm dlx shadcn@latest list seenhealth/medplum
pnpm dlx shadcn@latest view seenhealth/medplum/form-section
```

Items land in `components/medplum/`, `lib/medplum/` and `hooks/medplum/` under your configured shadcn aliases; the shadcn primitives they need (`field`, `native-select`, …) are pulled from the official registry, and `@medplum/core` / `@medplum/react-hooks` are added as npm dependencies. Your project needs Tailwind v4 and a `components.json` (`npx shadcn@latest init -d --base radix`).

The installed files do not carry the source headers (the CLI strips leading comments). They are derived from `@medplum/react` under Apache-2.0; attribution and the modification notice live in this package and in the `docs` message shown by the CLI on install.

## Develop

```bash
export PATH=$HOME/.nvm/versions/node/v22.22.2/bin:$PATH   # Node 22.22+ (repo engines)
cd packages/react-shadcn
npm test                              # ported upstream unit tests (jsdom)
npm run test:stories                  # every story rendered in Chromium (Vitest browser mode)
npm run storybook                     # http://localhost:6007 — same story IDs as storybook.medplum.com
npm run typecheck && npm run lint
npm run registry:build                # regenerate ../../registry.json from registry/items.mjs
npm run registry:build -- --check     # CI: fail if stale
npm run registry:smoke -- <item>      # install <item> into a scratch Vite app with the shadcn CLI and tsc it
npm run parity -- <item>              # API deltas vs packages/react/src → parity/<item>.md
npm run compare:stories -- <item>     # side-by-side PNGs vs storybook.medplum.com → artifacts/
npm run ledger:update -- <item>       # record L1/L2/L5/L6 results and regenerate MIGRATION_STATUS.md
npm run upstream:diff -- <item>       # logic diff vs upstream (expect none)
npm run upstream:diff -- <old> <new>  # upstream files changed between two medplum SHAs → affected items
npm run check:no-mantine && npm run check:no-css-modules
```

Sibling packages (`@medplum/core`, `@medplum/react-hooks`, `@medplum/mock`, `@medplum/definitions`) must be built once (`npx turbo run build --filter=@medplum/react-hooks...` from the repo root) for `tsc`; tests and Storybook resolve them from source through `aliases.mjs`.

## Port a component

1. `node scripts/port.mjs <UpstreamDir>` copies the component, tests and stories from `packages/react/src` with the Apache §4(b) notice and rewritten imports.
2. Follow [`docs/porting-rules.md`](./docs/porting-rules.md) and [`docs/translation-guide.md`](./docs/translation-guide.md); `src/components/medplum/human-name-input.tsx` is the golden example, `form-section.tsx` / `panel.tsx` / `modal.tsx` show the composition rule.
3. Register the item in `registry/items.mjs`, write `docs/migration/<item>.md` if the API changed, then run the commands above until `ledger:update` reports `done`.

## Layout

```
registry/items.mjs        source of truth for registry.json (name, files, upstream dir); deps are derived from imports
src/components/ui/        shadcn primitives installed by the CLI (MIT, never hand-edited) + stepper, ring-progress
src/components/medplum/   ported components, one kebab-case file per item, tests and stories alongside
src/lib/medplum/          ported utils (outcomes, dom, date, diff, blame, pagination, notify, …)
src/hooks/medplum/        replacements for the @mantine/hooks the ports used
src/test/                 setup.ts (FHIR schema indexing, jsdom stubs), render.tsx (TooltipProvider + Toaster)
.storybook/               package-local Storybook 10: MedplumProvider(MockClient), frozen clock, .dark toggle
scripts/                  port, build-registry, registry-smoke, parity-report, compare-stories, ledger, upstream-diff, check-hygiene
docs/migration/<item>.md  API deltas per item (required whenever parity reports a delta)
```
