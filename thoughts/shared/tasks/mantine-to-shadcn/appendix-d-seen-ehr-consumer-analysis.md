# seen-ehr UI Architecture Analysis — Inputs for a Medplum→shadcn Registry

Research for the design document on migrating `@medplum/react` (Mantine-based) to a shadcn/ui + Tailwind
component registry. This report documents how `seenhealth/seen-ehr` (Seen Health's Orbit EHR) built its
own shadcn-based UI package (`@seen/ui`) and domain package (`@seen/react`), and precisely how the same repo
currently consumes `@medplum/react`, so the new registry's surface area can be designed to displace those
usages. No repo files were modified in the course of this research.

---

## 1. `packages/ui` structure and conventions

### 1.1 Directory layout (`packages/ui/src/components`)

`@seen/ui` (`packages/ui`, version `0.1.0`) is described in its own `CLAUDE.md`/`AGENTS.md` as: "shadcn-based
primitives and UI-only components... may depend on `@seen/core`; must not depend on `@seen/react`, apps, or
domain model behavior."

Component directories under `packages/ui/src/components/` (one folder per component, PascalCase, containing
the component, sub-parts, `.stories.tsx`, and helper `.ts` files):

| Directory | Files | Shadcn-derived primitive vs. custom |
|---|---|---|
| `Accordion/` | `Accordion.tsx`, `AccordionItem.tsx`, `AccordionTrigger.tsx`, `AccordionContent.tsx` | shadcn (Radix Accordion wrapper) |
| `Badge/` | `Badge.tsx`, `.stories.tsx` | shadcn primitive, extended with a custom `badge-v2` Tailwind variant system (see §1.4) |
| `Button/` | `Button.tsx`, `ButtonGroup.tsx`, `buttonVariants.ts`, `linkVariants.ts`, `isTextButtonVariant.ts` | shadcn primitive (cva-based), heavily extended with Seen-specific variants (`status`, `underline`, `teal` color, `badge-v2:` compound variants) |
| `Collapsible/` | `Collapsible.tsx`, `CollapsibleTrigger.tsx`, `CollapsibleContent.tsx` | shadcn (Radix Collapsible) |
| `ContextMenu/` | 12 files (`ContextMenu`, `…Content`, `…Item`, `…CheckboxItem`, `…RadioGroup/Item`, `…Sub*`, `…Shortcut`, etc.) | shadcn (Radix ContextMenu) |
| `DotSeparator/` | `DotSeparator.tsx` | custom — trivial `· ` glyph span |
| `HoverCard/` | `HoverCard.tsx`, `HoverCardTrigger.tsx`, `HoverCardContent.tsx`, `findScrollableAncestor.ts` | shadcn (Radix HoverCard) + custom scroll-ancestor helper |
| `ImageZoom/` | `ImageZoom.tsx` | custom wrapper around third-party `react-medium-image-zoom` |
| `Item/` | `Item.tsx`, `ItemActions/Content/Description/Footer/Group/Header/Media/Separator/Title.tsx` | shadcn "Item" pattern (cva + `Slot`), a newer shadcn block for flexible list rows |
| `KBD/` | `KBD.tsx`, `.stories.ts` | custom — trivial `<kbd>` styling wrapper |
| `Label/` | `Label.tsx` | shadcn (Radix Label) |
| `Markdown/` | `Markdown.tsx` | custom wrapper around `streamdown`/`@streamdown/*` (AI markdown rendering, not shadcn) |
| `MaskedInput/` | `MaskedInput.tsx`, `ssn-utils.ts` | custom wrapper around `react-imask` |
| `MiniCalendar/` | `MiniCalendar.tsx` | shadcn "block"-style composite (Radix Slot + `useControllableState`), a horizontal date-strip picker |
| `ReorderList/` | `ReorderList.tsx` | custom, built on `@dnd-kit/*` (drag-and-drop reorder list, not a shadcn primitive) |
| `Separator/` | `Separator.tsx` | shadcn (Radix Separator) |
| `StarToggle/` | `StarToggle.tsx` | custom, composed from `@seen/ui` `Button` + tabler star icons |
| `Table/` | `Table.tsx`, `TableBody/Caption/Cell/Footer/Head/Header/Row.tsx` | shadcn primitive |
| `Tabs/` | `Tabs.tsx`, `TabsList/Trigger/Content.tsx`, `ResponsiveTabs.tsx`, `useOverflowTabs.ts` | shadcn (Radix Tabs) + custom `ResponsiveTabs` overflow-aware wrapper |
| `Typography/` | `TypographyDetail/Overline/PageTitle/PUI/Subtle/Tiny.tsx`, `typographyVariants.ts` | custom, cva-based text style presets — a common shadcn-community pattern (see shadcn "Typography" block), tailored to Seen tokens |
| `VisuallyHidden/` | `VisuallyHidden.tsx` | shadcn (Radix VisuallyHidden re-export) |
| `ai-elements/` | `Agent/`, `Context/`, `ContentMap/`, `Mention/`, `PromptInput/`, `Reasoning/`, `Shimmer/`, `Skill/`, `Suggestion/`, `Terminal/`, `Tool/`, `_shared/Panel.tsx` | Custom AI-chat UI kit (mirrors Vercel's "ai-elements" component set), exported via a **separate barrel** `ai-elements.ts`, not the main `index.ts` |
| `src/icons/` (not under `components/`) | `IconCalendar`, `IconChat`, `IconCircleCheck/X`, `IconComment`, `IconHexagon*` (5 variants), `IconIntervention`, `IconStandingOrder`, `IconTarget`, `IconUrgent`, `IconUser` | Custom SVG icon components (brand/domain icons not in Tabler's set) |
| `src/hooks/useIsLg.ts` | — | custom hook (breakpoint media query) |

Also present at the package root: `src/breakpoints.ts`, `src/cn.ts`, `src/baseTailwindConfig.ts`,
`src/styles.css`, and two separate export surfaces `ai-elements.ts` and `markdown.ts` (kept out of the main
barrel, likely to avoid pulling heavy AI-SDK/streaming deps into every consumer).

**Observation for the registry:** roughly half of `@seen/ui`'s components are near-verbatim shadcn/Radix
primitives (Accordion, ContextMenu, HoverCard, Label, Separator, Table, Tabs, VisuallyHidden, Item); the
other half are Seen-specific composites (Typography scale, MiniCalendar, ReorderList, MaskedInput, ai-elements
kit, custom icon set) that would not be part of a generic Medplum registry but illustrate the pattern of
"start from shadcn primitives, then layer product-specific composites on top with the same `cn()` + `cva`
conventions."

### 1.2 Core config files

**`packages/ui/index.ts`** — a flat `export *` barrel (`'use client'` at top) re-exporting every public
component/hook/icon by explicit file path (`#src/components/...`). `ai-elements.ts` and `markdown.ts` are
separate barrels not included here (kept import-cost-isolated).

**`packages/ui/src/cn.ts`**:
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```
Standard shadcn `cn()` helper, unmodified from the canonical pattern.

**`packages/ui/src/styles.css`** — **Tailwind v3 syntax** (`@import 'tailwindcss/base'`, not the v4
`@import "tailwindcss"` one-liner). Key characteristics:
- Imports Mantine's compiled CSS (`@mantine/core/styles.css`, `@mantine/dates/styles.css`,
  `mantine-react-table/styles.css`) **before** Tailwind's base/components/utilities layers, with a comment
  explaining this ordering is deliberate: unlayered Tailwind must win over layered Mantine so app styles can
  override Elation's injected styles in the Sidecar extension.
- shadcn's canonical background/foreground HSL-variable convention (explicit comment: "We use a background
  and foreground convention for colors, based on https://ui.shadcn.com/docs/theming... We use HSL because
  Tailwind doesn't support LCH/OKLCH yet.").
- Full token set in `:root` / `.dark`: `--frame`, `--background`, `--foreground` (+ `-secondary`,
  `-tertiary`, `-900`, `-underline`), `--contrast`, `--muted` (+ `-foreground/-border/-hover`), `--card`,
  `--popover`, `--overlay`, `--border` (+ `-hover`), `--input`, `--badge`, `--primary` (+ `-hover`,
  `-foreground`), `--secondary`, `--accent`, `--active`, `--destructive`, `--ring`, `--placeholder`,
  `--radius`.
- **Dark mode**: class-based (`.dark` selector), driven by Tailwind's `darkMode: 'selector'` config (see
  §1.3) — i.e. a `dark` class toggled on a root element, not OS `prefers-color-scheme` media queries.
- Print-specific rules (`@media print`), custom fonts (Reckless serif, DMSans + CJK fallback stack with
  detailed comments on Chrome print-pipeline quirks), and one raw Mantine CSS override
  (`.mantine-Accordion-root > .mantine-Accordion-item:last-child`).

**`packages/ui/src/baseTailwindConfig.ts`** — exported as `Omit<Config, 'content'>` so both `packages/ui` and
consuming apps (`apps/portal`) spread it and only override `content` globs. Notable design choices:
- Every shadcn theme color (`frame`, `background`, `foreground`, `muted`, `card`, `popover`, `border`,
  `input`, `primary`, `secondary`, `accent`, `destructive`, `ring`, `placeholder`) is wired to the CSS
  variables via `hsl(var(--x))`.
- A large **custom brand palette** on top of the shadcn tokens: full 50–950 scales for `blue`, `gray`,
  `green`, `teal`, `red`, `pine`, `yellow`, plus one-off named colors (`seen-green`, `persimmon`,
  `black-pearl`).
- A **second, parallel "badge-v2" color system** (`'badge-v2': { 'neutral-bg', 'neutral-border',
  'neutral-text', 'red-bg', ... }`) gated behind a custom Tailwind **variant plugin**
  (`addVariant('badge-v2', ':where(.badge-contrast-v2) &')` / `addVariant('not-badge-v2', ...)`) toggled by a
  feature flag (`badge-contrast-v2`) that adds a root class. This is a concrete pattern for running a visual
  redesign of a shared component behind a flag without forking the component: the flag only ever appends a
  root class, and all before/after styling lives in the same component via variant-prefixed Tailwind classes.
- Radix-driven `keyframes`/`animation` for `accordion-down/up`, `collapsible-down/up` (using
  `var(--radix-accordion-content-height)` etc. — the standard shadcn recipe).
- Uses the `tailwindcss-animate` plugin (`tailwindAnimate`).
- `zIndex.portal = '200'` explicitly pinned to match Mantine's historical default portal z-index — a
  compatibility shim to keep Radix portals (Dialog, Popover, etc.) layering consistently with legacy Mantine
  overlays during the migration.

**`packages/ui/tailwind.config.ts`** — thin, spreads `baseTailwindConfig` and sets `content:
['./src/**/*.{ts,tsx}']`.

**`packages/ui/postcss.config.mjs`** — `postcss-import` (resolves `@import` from `node_modules`, e.g. the
Mantine CSS imports above) → `tailwindcss` → `autoprefixer`. Comment: "if you add plugins here, rerun `pnpm
dev`."

**`packages/ui/tsconfig.json`** — extends repo-wide `tsconfig.package.json`; declares the `#src/*` → `./src/*`
path alias; excludes `*.stories.{ts,tsx,mdx}` from the package's own type-check build (so Storybook types
don't leak into consumers).

**Biome/ESLint**: there is **no per-package `biome.json`** in `packages/ui` — Biome config is repo-root only
(root `biome.json`), applied uniformly. Relevant rules for a registry package: 2-space
indent, single quotes, `semicolons: asNeeded`, `noEnum: error` (no TS `enum`), `noNonNullAssertion: error`,
`useImportType: error`, and a `.tsx`-only override enabling a11y rules (`noLabelWithoutControl`,
`useKeyWithClickEvents`, etc., at `warn`). ESLint (`eslint.config.mjs`, root-level) runs *alongside* Biome
for rules Biome doesn't cover: `react-hooks/exhaustive-deps`, `@tanstack/query/*`, `no-restricted-imports`
(see §2.1 — this file is where the Mantine/Medplum→`@seen/*` redirect rules live), `jsdoc/*`, and
`check-file/filename-naming-convention` (PascalCase `.tsx`, camelCase `.ts`).

**No `components.json`** exists anywhere in the repo (verified via repo-wide search) — i.e. seen-ehr does
**not** use the shadcn CLI (`npx shadcn add ...`) with its standard config-driven install flow; every
component was hand-authored/hand-adapted into `packages/ui/src/components/<Name>/<Name>.tsx` following a
fixed folder convention instead of being CLI-scaffolded into a flat `components/ui/*.tsx` directory. This is
a deliberate structural difference from the canonical shadcn registry layout worth calling out explicitly in
the design doc.

### 1.3 Variants, icons, subpath exports

- **Variants**: `class-variance-authority` (`cva`) throughout, exactly the shadcn convention. `buttonVariants.ts`
  is a good representative example — `cva(base, { variants: { variant, size, color, loading, selected },
  compoundVariants: [...], defaultVariants: {...} })`, with `compoundVariants` used for both structural
  overrides (e.g. `variant: 'outline', size: 'icon'` → different padding) and for wiring the `badge-v2:`
  variant-prefixed classes onto specific `variant`+`color` combinations.
- **Icon library**: `@tabler/icons-react` is the standard (both `@seen/ui` and `@seen/react` CLAUDE.md files
  say "Use `@tabler/icons-react` for icons"); confirmed via `package.json` deps and zero `lucide-react`
  usage anywhere in the repo (shadcn's own default icon set is lucide, so this is an explicit substitution
  seen-ehr made). Custom brand icons that Tabler doesn't have live in `packages/ui/src/icons/`.
- **Button subpath export**: `package.json` `exports` map has a dedicated
  `"./button": "./src/components/Button/Button.tsx"` entry (alongside `"./cn"`, `"./baseTailwindConfig"`,
  `"./src/styles.css"`) in addition to the primary `"."` barrel. The package's own comment explains why:
  *"Subpaths (./button, ./cn, etc.) require transpilePackages in consumer. Primary barrel export (.) works
  without transpilation."* — i.e. subpath exports point straight at `.tsx` source (no build step for this
  package), so any consumer importing a subpath must add the package to their bundler's `transpilePackages`
  list; the dot-export is the "just works" default entrypoint. `Button` gets special-cased into a subpath
  probably because it's imported from contexts (e.g. `apps/portal/tailwind.config.ts`'s own comment about
  `@seen/ui` import issues) where pulling in the entire barrel is undesirable.

### 1.4 Mantine still inside `packages/ui`

`packages/ui/package.json` lists `@mantine/core@7.15.3`, `@mantine/dates@7.15.3`, and
`mantine-react-table@2.0.0-beta.6` as dependencies, but a source-level grep of
`packages/ui/src/**/*.{ts,tsx}` for `mantine`/`@mantine` returns **zero matches** — no `@seen/ui` *component*
imports or uses Mantine. The dependency exists purely because `packages/ui/src/styles.css` imports the
compiled Mantine CSS files (`@mantine/core/styles.css`, `@mantine/dates/styles.css`,
`mantine-react-table/styles.css`) so that `@seen/ui`'s Tailwind layer can be guaranteed to load *after* and
therefore override Mantine's styles wherever both are mounted in the same app (see the styles.css comment
about Sidecar/Elation quoted in §1.2). In other words: `@seen/ui` owns the **global stylesheet** for the
whole monorepo (including the parts of the app tree still rendering real Mantine components from `@medplum/react`
or `packages/react`), so it has to import and sequence Mantine's CSS even though none of its own components
use the library. The actual Mantine *component* usage lives in `apps/portal`, `apps/sidecar`,
`apps/meal-ticket-printer`, and — most heavily — in `packages/react/src/components/**` (see §2.3/§2.4 for
specifics); `packages/ui` itself is Mantine-CSS-only, Mantine-component-free.

### 1.5 Storybook conventions

Centralized Storybook app at `apps/storybook/` — stories physically live next to the components they
document in `packages/ui/` and `packages/react/`, not inside `apps/storybook/`.

**`apps/storybook/.storybook/main.ts`**:
- `stories` globs: `packages/ui/src/**/*.stories.@(ts|tsx)`, `packages/react/src/**/*.stories.@(ts|tsx)`,
  `apps/portal/src/**/*.stories.@(ts|tsx)` — i.e. three source trees are discovered by one Storybook
  instance, not one Storybook per package.
- `staticDirs`: `packages/ui/public`, `apps/portal/public`.
- Addons: `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-mcp` (Storybook's own MCP
  server, so agents can drive Storybook), `@chromatic-com/storybook`.
- Framework: `@storybook/react-vite`.
- `viteFinal` aliases `@storybook-config` → the `.storybook` dir (so any story can `import {...} from
  '@storybook-config/storyUtils.ts'`) and `@fhir-definitions` → the bundled `@medplum/definitions` R4 JSON
  (needed because `@medplum/definitions`' package export map only exposes an fs-based `readJson`, unusable in
  a browser bundle — the config resolves straight to the JSON files instead).

**`apps/storybook/.storybook/preview.tsx`** and **`storyUtils.ts`**: provide the two mandated global
snapshot-determinism utilities:
```ts
// storyUtils.ts
export const STORY_NOW = '2026-01-15T20:00:00.000Z' // frozen clock, via MockDate
export function storyDate(offsetMs = 0): Date { ... } // relative to STORY_NOW
export function placeholderImg(width, height = width): string { ... } // deterministic inline SVG, replaces picsum.photos
export const disableAllStorySnapshots = { chromatic: { disableSnapshot: true } } as const
export const enableThisStorySnapshot = { chromatic: { disableSnapshot: false } } as const
```
The workspace-wide rule (see `.cursor/rules/storybook-snapshots.mdc`) is: **one kitchen-sink `AllStates` /
`AllVariants` / `Gallery` story per file** that gets `tags: ['chromatic-snapshot']` +
`parameters: enableThisStorySnapshot`; every other story in the file is opted out via meta-level
`disableAllStorySnapshots`. This keeps Chromatic's snapshot count bounded while still giving reviewers
per-variant, per-state stories for docs/controls. A separate ESLint override on `**/*.stories.{ts,tsx}`
statically forbids bare `new Date()` / `Date.now()` / `today()` calls, forcing `storyDate()` or an explicit
ISO string instead — this is enforced at lint time, not just convention.

Medplum/FHIR-specific global decorator (`apps/storybook/.storybook/medplum-setup.tsx`,
`withMedplumProvider`): wraps every story in `MemoryRouter` → `MantineProvider theme={SeenMantineTheme}` →
`MedplumProvider medplum={mockMedplum}` → a local `QueryClientProvider` (retry disabled, infinite staleTime)
→ `ConfigContext.Provider` → `SeenApiContext.Provider` → `KnockInboxFeedContext.Provider`. The mock Medplum
client is `SeenMedplumMockClient` (see §1.6) with `getProfileAsync`/`getProfile` monkey-patched to return a
hardcoded `Practitioner`, which is also upserted into the mock store so `readResource()` calls against it
succeed. `initializeFhirDefinitions()` fetches the real R4 `profiles-types`/`profiles-resources`/
`search-parameters` JSON over HTTP (via the Vite `@fhir-definitions` alias) and calls
`indexStructureDefinitionBundle`/`indexSearchParameterBundle` so schema-aware components (and the mock
client's in-memory search) work in-browser.

Storybook conventions codified in `apps/storybook/CLAUDE.md`: CSF3 only, `satisfies Meta<typeof X>` +
`type Story = StoryObj<typeof meta>`, always `tags: ['autodocs']`, title prefixes `UI/` (from `@seen/ui`),
`React/` and `Core/` (from `@seen/react`), `Pages/`, `AI Chat/`. **No MSW, no `play` functions/interaction
tests, no loaders** — FHIR data is seeded directly via `useMedplum()` + mock-client helpers inside the story,
and React Query caches are pre-seeded with fixture helpers when a component expects cached rows. Chromatic
config: `apps/storybook/chromatic.config.json` (main-branch visual-test project, `onlyChanged: true`
TurboSnap) + `apps/storybook/chromatic.publish.config.json` (PR-preview-only project, UI Tests/Review off).

### 1.6 Test conventions

- **Vitest** per-package config (`packages/ui/vitest.config.ts`, `packages/react/vitest.config.ts`, etc.),
  not a single root config.
- `packages/react/vitest.config.ts` is the "normal" domain-test config: `environment: 'jsdom'`,
  `setupFiles: ['./vitest.setup.ts']`. `vitest.setup.ts` pre-indexes the full R4 FHIR structure/search-param
  bundles into Medplum's in-memory schema registry (via `@medplum/core`'s `indexStructureDefinitionBundle`/
  `indexSearchParameterBundle` + `@medplum/definitions`'s `readJson`) so every test file gets a fully
  schema-aware Medplum runtime for free, without per-test setup.
- `packages/ui/vitest.config.ts` is a **different, browser-mode config**: it wires the Storybook Vitest
  addon (`@storybook/addon-vitest`'s `storybookTest({ configDir: ... })` plugin) and runs
  `test.browser: { enabled: true, headless: true, provider: 'playwright', instances: [{ browser: 'chromium'
  }] }` — i.e. `@seen/ui`'s "tests" are its own Storybook stories executed against a real headless Chromium
  via Playwright (Storybook's component-testing story-runner pattern), not jsdom unit tests. This is the one
  browser-mode Vitest config found in the repo.
- **Testing Library**: `@testing-library/react@16.3.2` (React 19-compatible major) used throughout
  `packages/react` `.test.tsx` files, with the standard `render`/`screen`/`fireEvent`/`waitFor`/`cleanup` API.
- **MSW: not used anywhere** in the repo (repo-wide grep for `msw` found zero matches in source or
  `package.json`), consistent with the explicit "Do not add MSW" rule in Storybook docs — the same avoidance
  extends to unit tests.
- **FHIR mocking**: everything routes through `@medplum/mock`'s `MockClient`, wrapped by a Seen-specific
  subclass, `SeenMedplumMockClient` (`packages/core/src/SeenMedplumMockClient.ts`):
  ```ts
  export class SeenMedplumMockClient extends SeenMedplumClientMixin(MockClient) {
    private mockValueSetData: Map<string, ValueSetExpansionContains[]> = new Map()
    setMockValueSetExpansion(url, contains): void { ... }
    override valueSetExpand(params, _options): ReadablePromise<ValueSet> { ... } // serves seeded fake ValueSet expansions
  }
  ```
  It applies the same `SeenMedplumClientMixin` used for the real production client (so mock and real clients
  share behavior/typing), and adds one override: `valueSetExpand` is faked from an in-memory seed map instead
  of hitting a terminology server, since `MockClient` doesn't implement it. Tests/stories then construct
  `new SeenMedplumMockClient()` directly and wrap the unit under test in `<MedplumProvider medplum={medplum}>`
  (see the `Combobox.test.tsx` excerpt below). A recurring jsdom-gap pattern in tests using Radix/cmdk-based
  components: manually stub `ResizeObserver`, `scrollTo`, and `Element.prototype.scrollIntoView` at the top of
  the test file, since jsdom doesn't implement them and cmdk (the shadcn Command/Combobox primitive) depends
  on all three.
  ```tsx
  // packages/react/src/components/core/combobox/Combobox.test.tsx
  import { MedplumProvider } from '@medplum/react'
  import { SeenMedplumMockClient } from '@seen/core/SeenMedplumMockClient'
  import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
  ...
  globalThis.ResizeObserver ??= class { observe(){} unobserve(){} disconnect(){} }
  globalThis.scrollTo ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
  let medplum: SeenMedplumMockClient
  function wrapper({ children }) {
    return (
      <MedplumProvider medplum={medplum}>
        <QueryProvider defaultQueryOptions={{ retry: false, staleTime: Infinity }}>
          {children}
        </QueryProvider>
      </MedplumProvider>
    )
  }
  ```
- A workspace-wide rule (`no-css-class-unit-tests.mdc`) explicitly forbids Vitest assertions on Tailwind
  utility classes (spacing/color/size tokens) — visual regressions belong in Storybook/Chromatic, not
  `.test.tsx` files; unit tests assert user-visible behavior (roles, text, ARIA state) only.

---

## 2. How seen-ehr consumes `@medplum/react` and `@medplum/react-hooks`

### 2.1 `@medplum/react-hooks`: not used at all

A repo-wide search for `from '@medplum/react-hooks'` returns **zero matches**, and no `package.json` in the
repo declares it as a dependency. seen-ehr consumes everything (hooks and components alike) through the
single `@medplum/react@5.1.17` package.

### 2.2 `@medplum/react` import inventory

60 files import from `@medplum/react`. Symbol counts (deduplicated by symbol name across all import sites;
"count" = number of distinct files importing that symbol):

| Symbol | Kind | Count | Representative files |
|---|---|---|---|
| `MedplumProvider` | Component (provider) | 27 | `apps/portal/src/Root.tsx`, `apps/sidecar/src/sidepanel/SidePanel.tsx`, `apps/meal-ticket-printer/src/Root.tsx`, `apps/preview/preview-provider.tsx`, and 23 `*.test.tsx` files across `packages/react/src/**` that wrap render trees for tests |
| `CodeableConceptDisplay` | Component | 6 | `packages/react/src/components/display/CodeableConceptsDisplay.tsx`, `.../organization/OrganizationDisplay.tsx`, `.../patient/detail-content/contact-tab/CareTeamCard.tsx`, `.../sdr/display/SDRRequesterContactInfo.tsx`, `.../sdr/display/SDRTable.tsx`, `apps/portal/src/pages/incidents/IncidentsPage.tsx` |
| `useMedplumProfile` | Hook | 5 | `packages/react/src/components/app/App.tsx` (aliased/re-exported), `.../hooks/useCurrentPractitioner.ts`, `.../components/KnockProvider.tsx`, `apps/portal/src/FeatureFlagBootstrap.tsx`, `apps/meal-ticket-printer/src/App.tsx` |
| `useMedplum` | Hook | 4 | `packages/react/src/components/medplum/ResourceForm.tsx`, `.../medplum/ResourceTable.tsx`, `.../questionnaire-form/CustomQuestionnaireForm.tsx`, `.../task/task-body/UploadDocumentTaskBody.tsx` |
| `QuestionnaireItemType` | Type/enum | 4 | `.../questionnaire-form/QuestionnaireFormItem.tsx`, `QuestionnairePageSequence.tsx`, `QuestionnaireRepeatableItem.tsx`, `QuestionnaireRepeatedGroup.tsx` |
| `ResourceTable` | Component | 3 | `.../appointment/AppointmentDisplayPage.tsx`, `.../medication-request/MedicationRequestDisplayPage.tsx`, `.../sdr/display/SDRActionDisplay.tsx` |
| `useResource` | Hook | 3 | `.../medplum/ResourceForm.tsx`, `.../medplum/ResourceTable.tsx`, `.../questionnaire-form/CustomQuestionnaireForm.tsx` |
| `ReferenceDisplay` | Component | 2 | `.../sdr/display/SDRFulfillmentUpdatesTable.tsx`, `.../task/task-body/UploadDocumentTaskBody.tsx` |
| `HumanNameDisplay` | Component | 2 | `.../app/header/HeaderDropdown.tsx`, `.../sdr/display/SDRRequesterContactInfo.tsx` |
| `ReferenceInput` | Component | 2 | `.../questionnaire-form/QuestionnaireFormItem.tsx`, `.../sdr/display/SDRCreateNotificationAttempt.tsx` |
| `killEvent` | Utility | 2 | `packages/react/src/components/TaskRowCheckbox.tsx`, `.../order/OrderListRow.tsx` |
| `ResourceAvatar` | Component | 2 | `.../app/header/HeaderDropdown.tsx`, `.../core/ResourceCard.tsx` |
| `useCachedBinaryUrl` | Hook | 1 | `packages/react/src/hooks/useStableAttachmentUrl.ts` (wrapped/re-exported — see §3 below) |
| `useMedplumContext` | Hook | 1 | `packages/react/src/hooks/useMedplum.ts` (re-exported as Seen's own `useMedplum`) |
| `SignInForm` | Component | 1 | `packages/react/src/components/SignInPageComponent.tsx` |
| `QuestionnaireForm` | Component | 1 | `packages/react/src/components/order/order-form/LabOrderForm.tsx` |
| `BackboneElementDisplay` | Component | 1 | `packages/react/src/components/medplum/ResourceTable.tsx` |
| `BackboneElementInput` | Component | 1 | `packages/react/src/components/medplum/ResourceForm.tsx` |
| `AsyncAutocomplete` / `AsyncAutocompleteOption` / `AsyncAutocompleteProps` | Component + types | 1 | `packages/react/src/components/input/ICD10AsyncAutocomplete.tsx` |
| `FormSection` | Component | 1 | `.../questionnaire-form/QuestionnaireRepeatableItem.tsx` |
| `AttachmentInput`, `CheckboxFormSection`, `CodingInput`, `DateTimeInput`, `QuantityInput`, `ReferenceInput`, `ResourcePropertyDisplay`, `getItemAnswerOptionValue`, `getItemInitialValue`, `getNewMultiSelectValues`, `getQuestionnaireItemReferenceFilter`, `getQuestionnaireItemReferenceTargetTypes` | Components + utility functions (questionnaire item rendering) | 1 each | all in `packages/react/src/components/questionnaire-form/QuestionnaireFormItem.tsx` |
| `Form`, `isQuestionEnabled`, `QuestionnaireFormProps` | Component/util/type | 1 each | `packages/react/src/components/questionnaire-form/CustomQuestionnaireForm.tsx` |

**Reading the table**: `MedplumProvider` dominates by raw file count, but almost entirely as **test
boilerplate** (23 of its 27 sites are `*.test.tsx` wrapper trees) plus the handful of real app-root mounts
(`Root.tsx` in portal/sidecar/meal-ticket-printer, `preview-provider.tsx`). The genuinely load-bearing
*component* surface consumed from `@medplum/react` is concentrated in two places:
1. **The generic FHIR-editing/rendering primitives** used to build seen-ehr's own `ResourceForm`/
   `ResourceTable` (dev-tools pages — see §2.4) — `BackboneElementDisplay`, `BackboneElementInput`,
   `useResource`.
2. **The Questionnaire (FHIR form) rendering engine** — `CustomQuestionnaireForm.tsx` and
   `QuestionnaireFormItem.tsx` still delegate most item-type rendering to Medplum's built-in
   `AttachmentInput`, `CodingInput`, `DateTimeInput`, `QuantityInput`, `ReferenceInput`,
   `ResourcePropertyDisplay`, `CheckboxFormSection`, `FormSection`, `QuestionnaireItemType`, and several
   `getItem*`/`getQuestionnaireItemReference*` helper functions, while wrapping them in Seen's own
   `CustomQuestionnaireForm`/`AutoSaveCustomQuestionnaireForm` shells (see §2.4).

Everything else (`CodeableConceptDisplay`, `HumanNameDisplay`, `ReferenceDisplay`, `ResourceAvatar`,
`SignInForm`, `AsyncAutocomplete`) is a small, targeted display/input primitive used in 1–6 files each — the
kind of thing a shadcn-style registry would most naturally ship as standalone, independently-installable
components.

### 2.3 MantineProvider: still mounted

`apps/portal/src/Root.tsx` **still wraps the whole app in `MantineProvider`** (and `ModalsProvider` from
`@mantine/modals`):

```tsx
// apps/portal/src/Root.tsx
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { MedplumProvider } from '@medplum/react'
...
<MedplumProvider medplum={medplum} navigate={navigate}>
  <QueryProvider ...>
    ...
      <MantineProvider theme={SeenMantineTheme}>
        <ModalsProvider>
          <RouterProvider router={router} />
        </ModalsProvider>
      </MantineProvider>
    ...
  </QueryProvider>
</MedplumProvider>
```

`SeenMantineTheme` (`packages/react/src/theme.ts`) is a `createTheme()` call carrying custom color scales
(`pine`, `teal`, `charcoal`, `persimmon`) and font sizes — i.e. seen-ehr layered its *own* brand theme onto
Mantine rather than using Mantine's defaults, but the provider itself is still live. `apps/meal-ticket-printer/src/Root.tsx`
and three `apps/sidecar/**` entry points (`content-script/Anchor.tsx`, `popup/Root.tsx`,
`sidepanel/SidePanel.tsx`) also mount `MantineProvider` independently (each app boots its own React tree).
Storybook's `medplum-setup.tsx` decorator mounts the same `MantineProvider theme={SeenMantineTheme}` for
every story, confirming Mantine-rendering components are still exercised in the component explorer today.

CSS: `packages/ui/src/styles.css` imports the compiled `@mantine/core/styles.css` and
`@mantine/dates/styles.css` (plus `mantine-react-table/styles.css`) directly — there is no separate
`@medplum/react/styles.css` import anywhere in the repo (grep found none); Medplum's own component styling
apparently rides on Mantine's base styles without a distinct stylesheet import, or Medplum ships styles that
compose from Mantine's primitives without its own separate CSS bundle being imported. Either way, seen-ehr
did not find it necessary to import `@medplum/react/styles.css` explicitly.

A pre-existing internal planning doc, **`thoughts/shared/plans/mantine-to-shadcn-migration.md`**, documents
this transition in detail (see §2.5) — the repo already tracks a phased Mantine-removal plan whose final
phase (§5.1) is explicitly "Remove MantineProvider" from all four Root/entry files above, with the whole
`@mantine/*` family removed from `package.json` only after every consuming component is migrated.

### 2.4 seen-ehr components that re-implement Medplum concepts in shadcn style

`packages/react/src/components/` contains a substantial set of components that either directly parallel a
`@medplum/react` component/concept or wrap it in a Seen-shaped shell:

| Path | One-line description |
|---|---|
| `medplum/ResourceForm.tsx` | Thin dev-tool wrapper around Medplum's own `BackboneElementInput` (via `useMedplum`/`useResource`) — generic FHIR-resource editor form, used on internal `/dev` admin pages, not a shadcn reimplementation but a direct pass-through to Medplum's generic-resource UI |
| `medplum/ResourceTable.tsx` | Same pattern for read — wraps Medplum's `BackboneElementDisplay` to render an arbitrary FHIR resource as a property table, used by `AppointmentDisplayPage`, `MedicationRequestDisplayPage`, `SDRActionDisplay` as a "just show me the raw resource" fallback |
| `medplum/MedplumAppLink.tsx` / `DevMedplumAppLinkOverlay.tsx` | Dev-only deep links out to the Medplum admin app for a given resource — not a UI reimplementation, just a link-out |
| `questionnaire-form/CustomQuestionnaireForm.tsx` | Seen's replacement top-level questionnaire-rendering shell — analogous to Medplum's `QuestionnaireForm`, but adds Seen's own `Form` component, section/paging logic (`QuestionnairePageSequence`), and autosave; still delegates individual item widgets to Medplum's `AttachmentInput`/`CodingInput`/etc. |
| `questionnaire-form/AutoSaveCustomQuestionnaireForm.tsx` | Debounced-autosave variant of the above, wired to Seen's mutation/query hooks instead of a single submit action |
| `questionnaire-form/QuestionnaireFormItem.tsx` | Per-item renderer — the direct analog of Medplum's own questionnaire item dispatcher, but Seen-authored control flow around Medplum's leaf input components |
| `questionnaire-form/QuestionnairePageSequence.tsx`, `QuestionnaireRepeatableItem.tsx`, `QuestionnaireRepeatedGroup.tsx` | Paging/repeat-group logic for multi-page or repeatable questionnaire sections — Seen-original, no Medplum equivalent shipped |
| `display/CodeableConceptsDisplay.tsx` | Plural wrapper composing Medplum's `CodeableConceptDisplay` for arrays of `CodeableConcept` |
| `display/DataDisplay.tsx`, `AttributeTable.tsx`, `ResourceStatus.tsx`, `HoverableText.tsx`, `RelativeDateShortDisplay.tsx`, `RelativeDateTimeDisplay.tsx` | Generic FHIR-value/attribute display primitives — Seen-original, not wrapping Medplum, but occupy the same conceptual space as Medplum's `ResourcePropertyDisplay`/generic display components |
| `patient/PatientHeaderCard.tsx` + `detail-content/facesheet/*` (14 files: `FacesheetCard`, `FacesheetCardActions`, `FacesheetCardHeader`, `FacesheetCardContent`, `FacesheetCardCollapseTrigger`, `FacesheetCardCount`, `FacesheetCardIcon`, `FacesheetCardLabel`, `FacesheetCardTitle`, `FacesheetCollapseTriangle`, `FacesheetCardSection`, etc.) | A full **PatientHeader/Facesheet** implementation — Seen-original shadcn-style component set built from scratch (no Medplum equivalent imported); this is the closest analog to what Medplum's own `PatientSummary`/header components would be replacing |
| `TimelineListRow.tsx`, `TimelineNoteComposerDialog.tsx`, `AddTimelineNoteButtonNode.tsx` | Participant activity **Timeline** — Seen-original, shadcn-styled, no direct Medplum import; conceptually parallels a Medplum Timeline component |
| `input/ICD10AsyncAutocomplete.tsx` | Wraps Medplum's `AsyncAutocomplete`/`AsyncAutocompleteOption`/`AsyncAutocompleteProps` (still Mantine-`Pill`-based per the migration plan) for ICD-10 code search — a case where the *search/autocomplete engine* is still Medplum's, only the domain wiring is Seen's |
| `core/combobox/Combobox.tsx` (+ `index.ts`) | Seen's own shadcn/Radix+cmdk-based **Combobox**, the designated replacement for Medplum's `AsyncAutocomplete` and Mantine `Select`, per the migration plan's decision matrix |
| `core/form/AddressesField.tsx` | Seen-original `Address` field-array editor (shadcn `Form`/`FormField`), no Medplum `AddressInput` import |
| `patient/detail-content/contact-tab/AddressDisplay.tsx` | Seen-original address display, no Medplum `AddressDisplay` import |
| `core/dialog/*`, `core/dropdown-menu/*`, `core/hover-card/*`, `core/tooltip/*`, `core/accordion` (via `@seen/ui`), `core/data-table/*` | The shadcn/Radix component set that the migration plan designates as the target replacement for Mantine `Modal`/`Menu`/`HoverCard`/`Tooltip`/`Accordion`/Mantine React Table |
| `sdr/display/SDRTable.tsx`, `SDRRequesterContactInfo.tsx`, `organization/OrganizationDisplay.tsx`, `patient/detail-content/contact-tab/CareTeamCard.tsx` | Domain display components still directly importing Medplum's `CodeableConceptDisplay`/`HumanNameDisplay` rather than a Seen equivalent (no Seen `CodeableConcept`/`HumanName` display component exists yet) |
| `core/ResourceCard.tsx`, `app/header/HeaderDropdown.tsx` | Still import Medplum's `ResourceAvatar` directly (no Seen `ResourceAvatar` equivalent yet) |

**Net picture**: seen-ehr has fully reimplemented (in shadcn style, no Medplum import) the *layout/shell*
components — PatientHeader/Facesheet, Timeline, Combobox, Dialog, DropdownMenu, Form fields — but still
leans on Medplum's own components for **generic FHIR-value display/input** (`CodeableConceptDisplay`,
`HumanNameDisplay`, `ResourceAvatar`, `ReferenceDisplay`/`ReferenceInput`, `BackboneElementDisplay`/
`BackboneElementInput`, the questionnaire item widgets, `AsyncAutocomplete`). This second category — the
generic FHIR-typed display/input primitives — is exactly the part of `@medplum/react` that a shadcn-based
registry replacement would need to prioritize, since it's the part seen-ehr never got around to
reimplementing itself and is still directly dependent on Mantine transitively through those Medplum
components.

### 2.5 Existing internal docs on Mantine removal / shadcn migration

- **`thoughts/shared/plans/mantine-to-shadcn-migration.md`** — a fully worked internal migration plan (not
  Medplum-registry-specific, but directly relevant prior art). Highlights:
  - An inventory table of every `@mantine/*` package still used and by which app/package (`core`, `hooks`,
    `form`, `dates`, `modals`, `notifications`, `nprogress`), each with an "Internal Equivalent" and file
    count/priority.
  - A **component decision matrix** mapping ~25 Mantine components to either an existing `@seen/ui`/
    `@seen/react` component, a shadcn registry component (with the exact `npx shadcn add <x>` command), or a
    third-party registry (**Kibo-UI** for `pill`/`spinner`/`relative-time`/`status`/`tags`/`mini-calendar`,
    **Dice-UI** for `stepper`).
  - Concrete before/after prop-mapping tables for the highest-effort migrations (Button variant/size
    mapping, Modal→Dialog, openConfirmModal→AlertDialog, Menu→DropdownMenu, Mantine `useForm`→React Hook
    Form, `useDisclosure`→plain `useState` or a new internal hook).
  - A "What We're NOT Doing" section (explicitly deferring Tooltip/HoverCard/Accordion/Table since they're
    "already mostly migrated," and `@mantine/notifications`/`@mantine/nprogress` pending later evaluation).
  - Phase 5 (final) is provider/package removal: strip `MantineProvider`/`ModalsProvider` from the four
    Root/entry files, then delete all `@mantine/*` deps from every `package.json`.
  - Status markers show at least one phase already executed (`### 1.1 Button Migration (18 files) ✅
    COMPLETED`, dated 2025-12-27, on a named branch), confirming this is a live, actively-worked plan, not
    a stale doc.
- **`thoughts/VERCEL-DEBUGGING.md`** — mentions Mantine only incidentally (unrelated to the migration).
- No other `.md` files under `docs/` reference Mantine or shadcn migration specifically; the authoritative
  design intent lives in the `thoughts/shared/plans/` doc plus the `packages/ui/CLAUDE.md` /
  `packages/react/CLAUDE.md` conventions already covered in §1.

---

## 3. Tooling compatibility surface

| Dimension | Value | Source |
|---|---|---|
| Tailwind version | **v3.4.17** everywhere (`packages/ui`, `packages/react`, `apps/portal` all pin the same version) | `packages/ui/package.json`, `apps/portal/package.json` |
| Tailwind config style | v3 JS/TS config (`tailwind.config.ts` exporting `satisfies Config`), **not** v4's CSS-first `@theme` syntax | `packages/ui/tailwind.config.ts`, `apps/portal/tailwind.config.ts` |
| Tailwind config sharing | One `baseTailwindConfig` (in `@seen/ui`) is spread by every app/package's own `tailwind.config.ts`, which only supplies its local `content` globs | `apps/portal/tailwind.config.ts` comment: *"Trying to import from @seen/ui causes an error when running `pnpm dev`"* — apps import `@seen/ui/baseTailwindConfig` via the dedicated subpath export, not the main barrel, specifically to dodge a `.tsx`-transpilation issue |
| React version | **19.1.0** everywhere | `packages/react/package.json`, `packages/ui/package.json`, `apps/portal/package.json` |
| Medplum version | **5.1.17** pinned across `@medplum/core`, `@medplum/fhirtypes`, `@medplum/react` in every consumer (`packages/react`, `apps/portal`, `apps/sidecar`, `apps/meal-ticket-printer`, `apps/preview`) | respective `package.json` files |
| TypeScript | `"typescript": "npm:@typescript/typescript6@6.0.2"` — the repo has switched to the experimental **TypeScript 6 / native (Go) compiler preview** package alias, not stock `typescript` | `packages/react/package.json`, `apps/portal/package.json` |
| Import style | `#` subpath-import convention (Node package `imports` field, e.g. `"#src/*": "./src/*"`), always with explicit `.ts`/`.tsx` extensions on relative-looking imports; enforced by a custom ESLint rule `seen/require-ts-extensions` and `no-relative-import-paths/no-relative-import-paths` (relative imports banned outside the same folder) | every package's `package.json` `imports` field + `tsconfig.json` `paths`; `eslint.config.mjs` |
| Linting | **Biome is primary** (formatting + most lint rules, single root `biome.json`, no per-package overrides for `packages/ui`), **ESLint runs alongside** for rules Biome doesn't implement (`react-hooks/exhaustive-deps`, TanStack Query rules, `no-restricted-imports`, JSDoc rules, filename-case rules, a few custom `seen/*` rules) | `biome.json`, `eslint.config.mjs` (comment: *"Minimal ESLint config to complement Biome... This runs alongside Biome during the migration period"*) |
| Workspace layout | pnpm workspaces: `apps/*`, `agents/*`, `packages/*`, `mcp-servers/*` (`pnpm-workspace.yaml`); notable `pnpm-workspace.yaml` features — `enableGlobalVirtualStore: false` (worktree compatibility), a `minimumReleaseAgeExclude` allowlist that **exempts `@medplum/*` from the standard 7-day minimum-release-age gate** (explicitly to let `pnpm upgrade:medplum` always grab the newest Medplum release), plus `packageExtensions` patching missing peer-dep declarations for two `@tiptap/*` packages |
| Task runner | **Turborepo** (`turbo.json`) — `build`/`lint`/`lint:fix`/(others truncated) tasks with `dependsOn: ["^build"]` and broad `inputs`/`outputs` globs (excludes `docs/`, `thoughts/`, `*.md` from build-cache inputs; treats `dist/**`, `.vercel/output/**`, `.next/**`, `storybook-static/**` as cacheable outputs) | `turbo.json` |
| No-restricted-imports redirects | The `eslint.config.mjs` `frontendRestrictedImportsPaths` array already **hard-bans direct imports of several `@medplum/react` / `@mantine/*` / `@tanstack/react-query` symbols outside their designated wrapper**, redirecting each to a `@seen/*` equivalent (see below) | `eslint.config.mjs` (lines ~59–166) |

**The concrete redirect list already enforced by CI-blocking lint rules** (this is effectively seen-ehr's own
"migration contract" and a strong signal for what a Medplum registry's hook/utility surface should look
like):

```js
{ name: '@medplum/react', importNames: ['useMedplum'], message: 'Use useMedplum from @seen/react.' },
{ name: '@medplum/react', importNames: ['useMedplumProfile'], message: 'Use useCurrentPractitioner from @seen/react.' },
{ name: '@medplum/react', importNames: ['useSearch','useSearchOne','useSearchResources','useResource'],
  message: 'Use useFhirSearch, useFhirSearchOne, or useFhirRead from @seen/react.' },
{ name: '@medplum/react', importNames: ['usePrevious'], message: 'Use usePrevious from @seen/react.' },
{ name: '@medplum/react', importNames: ['buildInitialResponse'], message: 'Use ValidatedToolResponse.build from @seen/core.' },
{ name: '@medplum/react', importNames: ['Loading'], message: 'Use Loader from @seen/react.' },
{ name: '@medplum/react', importNames: ['useCachedBinaryUrl'],
  message: 'Use useStableAttachmentUrl from @seen/react. It wraps useCachedBinaryUrl and handles external URLs correctly.' },
{ name: '@mantine/core', importNames: ['Loader'], message: 'Use Loader from @seen/react.' },
{ name: '@mantine/hooks', importNames: ['usePrevious'], message: 'Use usePrevious from @seen/react.' },
```
(plus unrelated `@medplum/core` redirects to `@seen/core` helpers, and a `@tanstack/react-query` `useQuery`
redirect to Seen's own wrapper). Note the asymmetry: this list **redirects hooks and a couple of low-level
utilities**, but places **no restriction on `@medplum/react` component imports** (`ResourceTable`,
`CodeableConceptDisplay`, `HumanNameDisplay`, the questionnaire widgets, etc.) — those remain freely
importable today, which matches the §2.4 finding that seen-ehr has migrated its *providers/hooks* off
Medplum far more completely than its *generic FHIR display/input components*.

---

## Implications for the medplum→shadcn registry

1. **Ship the "generic FHIR value" primitives first, not the app-shell components.** seen-ehr's own
   migration stalled exactly at the boundary between "things with an obvious Tailwind equivalent" (Button,
   Modal→Dialog, Menu→DropdownMenu — all fully migrated) and "things that need real FHIR-type-aware
   rendering logic" (`CodeableConceptDisplay`, `HumanNameDisplay`, `ResourceAvatar`, `ReferenceDisplay`/
   `ReferenceInput`, `BackboneElementDisplay`/`BackboneElementInput`, the Questionnaire item widgets —
   all still imported from `@medplum/react` today, §2.2/§2.4). A shadcn registry's highest-leverage v1 scope
   is exactly this second bucket, since it's the part no downstream consumer has independently reimplemented.

2. **Design the registry so hooks and components can be adopted independently and incrementally.**
   seen-ehr's `no-restricted-imports` rules (§3) already redirect Medplum *hooks* (`useMedplum`,
   `useMedplumProfile`, `useResource`/`useSearch*`, `usePrevious`, `useCachedBinaryUrl`) to `@seen/react`
   wrappers while leaving Medplum *components* untouched — proof that hook-level and component-level
   migration proceed on different timelines in a real consuming repo. Publish hooks/data-access and
   presentational components as separately installable registry items (as shadcn registries already support
   via `registryDependencies`/individual `.json` items), not one monolithic package.

3. **Don't require the shadcn CLI's `components.json`/flat-`components/ui` convention if consumers already
   have their own layout.** seen-ehr has zero `components.json` anywhere and instead hand-adapted every
   component into a `packages/ui/src/components/<PascalCaseName>/<Name>.tsx` (+ colocated `.stories.tsx`)
   folder-per-component layout. A registry should either (a) support install targets that respect an
   existing folder convention via `registry.json` `files[].target` overrides, or (b) explicitly document
   that its default flat layout is a starting point, not a requirement, for teams with established
   structure.

4. **Default to CSS variables + HSL + class-based dark mode (`darkMode: 'selector'`), matching shadcn's own
   canonical theming doc, but expect consumers to graft a much larger custom palette on top.** seen-ehr's
   `baseTailwindConfig.ts` wires every shadcn semantic token to `hsl(var(--x))` exactly per
   ui.shadcn.com's theming guide, then adds ~8 full 50–950 brand color scales and one bespoke variant-gated
   "badge-v2" palette. The registry's theme tokens should stay minimal and semantic (background/foreground
   pairs only) so they layer cleanly under a consumer's own larger palette rather than competing with it.

5. **Ship as Tailwind v3-compatible by default (or provide a clearly-labeled v4 track) and confirm which
   version the target repo is actually on before assuming v4.** seen-ehr's entire stack — `@seen/ui`,
   `@seen/react`, `apps/portal` — is pinned to Tailwind **v3.4.17** with the classic JS-config
   (`tailwind.config.ts`) approach, not v4's CSS-first config. A Medplum registry aimed at real consuming
   codebases in 2026 should either target v3 syntax directly or ship a documented, mechanical v3↔v4
   config-conversion note, since teams mid-migration (like seen-ehr) are exactly the kind of adopter this
   registry is for.

6. **Use `@tabler/icons-react` as an equally-supported icon option, not just lucide.** shadcn's default
   icon set is lucide, but seen-ehr standardized on Tabler icons across both `@seen/ui` and `@seen/react`
   with zero lucide usage anywhere in the repo. If component source ships with hardcoded lucide imports,
   every consumer on Tabler (a common enterprise choice, per Mantine's own historical default) has to
   hand-edit every installed file. Prefer sourcing icons through a small indirection (a shared icon-prop
   pattern, or documenting the lucide→tabler name mapping) so a Tabler-only shop isn't fighting the
   registry's install step.

7. **Provide first-class, un-opinionated mock/test infrastructure built on `@medplum/mock`'s `MockClient`,
   because every downstream FHIR-aware component needs one.** seen-ehr's entire Storybook and Vitest story
   depends on a single subclassed `MockClient` (`SeenMedplumMockClient`) plus one-time R4
   structure-definition/search-parameter indexing (`indexStructureDefinitionBundle`/
   `indexSearchParameterBundle`). A registry that ships FHIR-typed components should also ship (or clearly
   document how to wire) an equivalent minimal mock-client + schema-indexing snippet, since every consumer
   will otherwise reinvent it — and, per seen-ehr's explicit convention, should avoid recommending MSW for
   this purpose (MockClient already intercepts at the right layer).

8. **Anticipate the CSS-load-order problem for any consumer still running a legacy UI library
   alongside the new components.** seen-ehr's `styles.css` has to import Mantine's compiled CSS *before*
   Tailwind's base/components/utilities layers specifically so unlayered Tailwind utility classes win
   override battles against a still-mounted `MantineProvider`. Document this pattern explicitly (import
   legacy library CSS first, keep the new registry's Tailwind output unlayered or `!important`-guarded where
   needed) for any team migrating gradually rather than in one atomic swap — which, per seen-ehr's own
   `mantine-to-shadcn-migration.md`, is the realistic default path even for a team that started the
   migration over a year ago.

9. **Match Medplum's own component API surface closely enough that `no-restricted-imports`-style codemods
   are mechanical.** seen-ehr's redirect list (§3) maps `@medplum/react` symbols to `@seen/react` symbols
   1:1 by *behavior*, not always by name (`useMedplumProfile` → `useCurrentPractitioner`,
   `useCachedBinaryUrl` → `useStableAttachmentUrl`). A registry designed for easy migration should publish an
   explicit old-name→new-name/old-prop→new-prop mapping table (as the internal `mantine-to-shadcn-migration.md`
   already does for Mantine, §2.5) alongside each component, specifically so consuming repos can write the
   same kind of ESLint `no-restricted-imports` migration guard seen-ehr already uses for Mantine/Medplum
   hooks — that pattern is clearly a preferred, load-bearing mechanism for this team, not an afterthought.

10. **Reuse the "kitchen-sink `AllStates` story + one-time visual-regression opt-in" pattern for any shipped
    Storybook stories**, since a registry likely to be consumed by teams already running Chromatic/visual
    regression (as seen-ehr does) benefits from stories that are cheap to snapshot by default. If the
    registry ships example stories, structure them the way seen-ehr's own convention requires
    (`disableAllStorySnapshots` at the meta level, one `enableThisStorySnapshot`-tagged composite per file)
    so adopting teams don't have to immediately prune a large uncurated snapshot surface on install.
