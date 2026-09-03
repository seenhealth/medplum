# mantine-to-shadcn

Research and plan for re-implementing `@medplum/react` (Mantine 8) as a shadcn/ui registry with behavior parity, verified per component against the upstream test suite and `storybook.medplum.com`.

| File | What it is |
|---|---|
| `01-research-medplum-react-shadcn-migration.md` | Findings: pinned sources, anatomy of `@medplum/react@5.1.36`, Mantine coupling profile, shadcn state of the world (Sept 2026), seen-ehr as first consumer, prior art, risks |
| `02-plan-shadcn-registry-migration.md` | Decisions D0–D11, target architecture, binding porting rules, Mantine→shadcn translation guide, executor work-unit template, six verification layers + ledger, 23 work units across 9 phases with exact upstream sizes, review checklist, upstream sync, seen-ehr adoption track, open questions |
| `03-goal-codex.md` | Paste-ready `/goal` texts: A (Phase 0 + golden example), B (full program), C (per-WU executor template) |
| `appendix-a-component-inventory.md` | Generated: per-directory LOC, Mantine imports, react-hooks usage, stories/tests counts (`scripts/inventory.mjs`) |
| `appendix-b-story-matrix.md` | Generated: all 330 upstream stories → Storybook IDs (100% matched against the live `index.json`) + per-dir test-case baseline (`scripts/stories.mjs`) |
| `appendix-c-behavior-contracts.md` | Per-group behavior contracts, load-bearing vs cosmetic Mantine usage, shadcn targets, difficulty ratings, cross-cutting concerns (notifications, CSS modules, theme APIs, Mantine-typed public props) |
| `appendix-d-seen-ehr-consumer-analysis.md` | How seen-ehr built `@seen/ui` and what it still imports from `@medplum/react` |
| `appendix-e-shadcn-registry-research.md` | shadcn CLI v4 registry format, import rewriting, GitHub registries, Base UI vs Radix, Storybook/Vitest patterns, prior art |
| `scripts/` | `inventory.mjs`, `stories.mjs` (set `MEDPLUM_REACT_SRC` to an upstream `packages/react/src` checkout), `wu-sizes.mjs` (sums appendix A/B per work unit) |

Regenerate the appendices against a new upstream pin:

```bash
git worktree add /tmp/medplum-upstream <sha> --detach
MEDPLUM_REACT_SRC=/tmp/medplum-upstream/packages/react/src node scripts/inventory.mjs > appendix-a-component-inventory.md
MEDPLUM_REACT_SRC=/tmp/medplum-upstream/packages/react/src node scripts/stories.mjs > appendix-b-story-matrix.md
node scripts/wu-sizes.mjs
```
