# Research: `@medplum/react` (Mantine) → shadcn/ui registry

Date: 2026-09-03. Author: Fable 5.1 (architect pass). Status: research complete, plan in `02-plan-shadcn-registry-migration.md`, paste-ready Codex goal in `03-goal-codex.md`.

Everything below was measured against pinned sources so executors can re-derive it. Regenerate the appendices with `node scripts/inventory.mjs` and `node scripts/stories.mjs` (paths inside the scripts point at a worktree of upstream `main`).

## 0. Pinned sources

| Source | Pin | Notes |
|---|---|---|
| `medplum/medplum` upstream `main` | Analyzed at `8d589869f` ("Updating to include HH info (#10427)"), `@medplum/react@5.1.36`. **Pin for the plan: `0e501215d`** ("Storybook test mode and cleanups (#10352)"), two commits later, same version — the only react change is `DiagnosticReportDisplay.stories.tsx` cloning fixtures instead of mutating them; `packages/storybook` gained `storybook build --test`. Appendices A/B remain valid. | The fork's sync branch `cursor/upstream-main-5-1-36-a44b` sits at `0e501215d`; the registry package is built in the fork on branches off it, so `packages/react/src` in the same tree is the reference. |
| `seenhealth/medplum` fork `main` | `7eb2f8836` ("Release Version 5.1.17") | Plain mirror: 0 unique commits, 605 commits behind upstream. Between the two pins `packages/react` + `packages/react-hooks` changed 276 files (+13,595 / −3,546) across 88 react commits. **Do not plan against the fork's checkout.** |
| `storybook.medplum.com` | Storybook 10.5.10, `index.json` v5, 363 stories (330 from `packages/react`, 32 from `packages/react-scheduling`, 1 `Colors`) | Live behavioral reference; every one of the 330 react story IDs derived from source matched the live index (appendix B). |
| `seenhealth/seen-ehr` | working tree at analysis time; `@medplum/react@5.1.17`, Tailwind 3.4.17, React 19.1, Radix | First consumer. Has its own live plan `thoughts/shared/plans/mantine-to-shadcn-migration.md`. |
| shadcn/ui | CLI v4 (March 2026); Base UI default for new projects (July 2026); GitHub registries public (June 2026) / private (Aug 2026); official registry index = 63 `registry:ui` items | Fetched `ui.shadcn.com/r/index.json`, per-item JSON, docs, and the CLI import transformer source. |
| Vercel `shadcn` skill | `vercel/vercel-plugin/skills/shadcn/SKILL.md` | Conventions used throughout: `init -d`, `add`, `build`, namespaced registries, `cn()`, cva variants, `data-slot`, no `forwardRef`. |

## 1. Anatomy of `@medplum/react` at upstream `main`

### 1.1 Numbers

- 128 directories under `packages/react/src`; 124 are component/feature dirs (the rest: `stories/`, `test-utils/`, `test-mocks/`, `utils/`).
- 29,318 source LOC; 36,160 test LOC in 154 `*.test.tsx` files containing **1,360 test cases**; 108 `*.stories.tsx` files containing **330 stories**; 44 CSS-module files.
- Build: `tsc` (types) + esbuild (ESM + CJS bundles) + api-extractor. Tests: Vitest + jsdom + Testing Library, run against sibling package *source* via `aliases.mjs` (no build needed). Storybook lives in `packages/storybook` and globs `../react/src/**/*.stories.tsx` plus `react-scheduling`.
- Peer deps: `@mantine/core|hooks|notifications|spotlight ^8`, `@medplum/core`, `@medplum/react-hooks`, optional `jsqr`, `signature_pad`. React 18/19.

### 1.2 Layering that already exists (and that we keep)

```
@medplum/core          FHIR client, schema (InternalSchemaElement, buildElementsContext, ElementsContextType),
                       formatters (formatHumanName, formatAddress …), validation → OperationOutcome
        ▲
@medplum/react-hooks   MedplumProvider, useMedplum, useResource, useSearch, useSubscription, useQuestionnaireForm,
                       usePatientSummaryData, useThreadInbox, useResourceBoard, useCachedBinaryUrl, useWhisper …
                       ── Mantine-free since medplum#3147 (Oct 2023); peer deps = @medplum/core + react only ──
        ▲
@medplum/react         128 dirs of components. This is the ONLY Mantine-coupled layer.
```

Consequence: the migration is a *presentation-layer* rewrite. Data fetching, FHIR schema logic, questionnaire state (`useQuestionnaireForm`), timeline loading, chat subscriptions, and search-request math (`SearchUtils.ts`) either already live below the Mantine line or are pure TypeScript inside `packages/react` that can be copied verbatim.

### 1.3 The schema-driven form engine (highest-value core)

`ResourceForm` → `BackboneElementInput` → `ElementsInput` → per-element `ResourcePropertyInput` → type dispatch (`ResourcePropertyInput.tsx` ~L239–L390: `switch (propertyType)` over `PropertyType.*` returning `TextInput` / `DateTimeInput` / `CodeInput` / `AddressInput` / `HumanNameInput` / `ReferenceInput` / `AttachmentInput` / `ResourceArrayInput` / `ExtensionInput` …).

Shared contracts (all Mantine-free, copy as-is):

- `ResourcePropertyInput.utils.ts`: `BaseInputProps { path; valuePath?; outcome? }`, `ComplexTypeInputProps<T> { name; defaultValue?; onChange?(value, propName?); disabled? }`, `PrimitiveTypeInputProps`, `getValuePath()`.
- `ElementsInput.utils.ts`: `ElementsContext` (React context typed by `@medplum/core`'s `ElementsContextType`: `elements`, `elementsByPath`, `getExtendedProps(path) → { readonly, hidden }`, `accessPolicyResource`, `debugMode`), `getElementsToRender()`.
- `utils/outcomes.ts`: `getErrorsForInput(outcome, expression)` — maps `OperationOutcome.issue[].expression` to a field, tolerant of `[n]` array indices. Every input renders `error={getErrorsForInput(outcome, errorPath + '.field')}`.
- `FormSection.tsx` = Mantine `Input.Wrapper` (label/description/asterisk/error) + `maybeWrapWithTooltip('Read Only')` for readonly elements. This is the single seam to replace with shadcn `Field` (`FieldLabel`, `FieldDescription`, `FieldError`).

Leaf inputs are small and mechanical. `HumanNameInput` is representative: state = one `useState(defaultValue)`, setters split strings on spaces (`given.split(' ')`), `use` select uses `||` (not `??`) so empty string clears the field, each sub-input is `disabled={props.disabled || <field>Props?.readonly}` from `getExtendedProps`, `name={props.name + '-given'}`, placeholders `Prefix/Given/Family/Suffix`, `data-testid="use"`. The tests assert exactly those placeholders/testids and the emitted object shape.

### 1.4 Mantine coupling profile

From appendix A (component-dirs using each import):

| Cosmetic layout (pure Tailwind replacement) | Form controls (→ shadcn `Field`/`Input`/…) | Behavior-bearing (needs a real primitive) |
|---|---|---|
| `Group` 42, `Stack` 21, `Text` 25, `Box` 15, `Flex` 10, `Divider` 9, `Title` 7, `Center` 7, `Paper` 5, `SimpleGrid` 2, `Grid` 1, `Space` 1, `Container` 1, `Blockquote` 1, `Kbd` 1, `Image` 1, `ThemeIcon` 1 | `TextInput` 22, `Button` 22, `ActionIcon` 17, `NativeSelect` 14, `Checkbox` 8, `Textarea` 5, `Radio` 2, `Switch` 1, `Chip` 1, `Input`(.Wrapper) 2, `PasswordInput` 1, `MultiSelect` 2, `SegmentedControl` 2 | `Combobox`/`useCombobox`/`PillsInput`/`Pill` (AsyncAutocomplete, auth), `Menu` 6, `Modal` 4, `Tooltip` 7, `Popover` 1, `Tabs` 2, `Pagination` 2, `Stepper` 1 (QuestionnaireForm pages), `Collapse` 2, `ScrollArea` 5, `Table` 6, `Avatar` 1, `Badge` 3, `Alert` 7, `Loader` 12, `LoadingOverlay` 1, `Skeleton` 2, `RingProgress` 1, `Indicator` 2, `CopyButton` 1, `AppShell`+`Spotlight` (AppShell), `useMantineColorScheme`/`useMantineTheme` |

- `@mantine/hooks`: `useDebouncedCallback` (3), `useDisclosure` (2), `useResizeObserver`, `useClipboard`, `useLocalStorage`.
- `@mantine/notifications` `showNotification`/`updateNotification`/`notifications.show|update`: 43 call sites across 17 files (top: `PharmacyDialog` 6, `BaseChat` 5, `ResourceTimeline` 5, `ThreadInbox` 4, `PatientAccountsForm` 4). Three patterns (appendix C §C.4): fire-and-forget, persistent (`autoClose: false` in `SmartAppLaunchLink`), and show-then-update-by-id (`ResourceTimeline`, `PatientAccountsForm`, `PatientExportForm`). One `notify` shim with a stable-id update covers all three.
- `@mantine/spotlight`: `AppShell/Spotlight.tsx` only (⌘K search) → shadcn `CommandDialog`.
- CSS modules (44 files) in 33 dirs; they style layout and hover states and reference Mantine CSS variables (`--mantine-color-dimmed`, `--mantine-spacing-*`). All translate to Tailwind utilities + shadcn tokens (`text-muted-foreground`, `p-4`).
- **40 dirs have zero Mantine imports** (all `*Display` leaves, `ResourceTable`, `ResourceBoard`, `ResourceBlame`, `ResourceDiff`, `PatientHeader`, timelines that delegate to `ResourceTimeline`, `ScrollToTop`, …). They still need CSS-module → Tailwind and they inherit Mantine through children, but their logic ports verbatim.
- Public props typed with Mantine types (must be redesigned, see plan §4.5): `PanelProps extends PaperProps` (also `Document`, `SignatureInput`), `ResourceName: TextProps`, `MedplumLink/SmartAppLaunchLink: AnchorProps`, `StatusBadge: BadgeProps` + `DefaultMantineColor`, `SubmitButton: ButtonProps`, `Modal: ModalProps`, `SensitiveTextarea: TextareaProps`, `ResourceAvatar: AvatarProps`, `OperationOutcomeAlert: AlertProps`, `LinkTabs: TabsProps`, `AsyncAutocomplete: ComboboxProps/ComboboxItem`, `Container: ContainerProps`, `PasswordInput: PasswordInputProps`, `MedplumLink: ElementProps`.

### 1.5 Test and story infrastructure (what we port)

- `test-utils/render.tsx`: wraps in `MantineProvider`; re-exports `screen/fireEvent/act/waitFor/within/userEvent` and autocomplete helpers (`typeInAutocomplete`, `clickAutocompleteOption`, `selectAutocompleteOption` — Mantine Combobox-specific and must be re-implemented for the new autocomplete).
- `test.setup.ts`: indexes R4 `profiles-types/resources/medplum` + search parameters from `@medplum/definitions`, stubs `matchMedia`, `ResizeObserver`, `scrollIntoView`, `sessionStorage`.
- `vitest.config.ts`: jsdom, CSS-module identity proxy, `signature_pad` mock, fake timers with `shouldAdvanceTime`.
- Test selectors across all 1,360 cases: `getByText` 1,233 · `getByTestId` 283 · `getByRole` 256 · `getByLabelText` 223 · `getByPlaceholderText` 180 · `getByDisplayValue` 74 · `getByTitle` 34. These are UI-library-agnostic; tests port if the new components preserve text, labels (`htmlFor`), placeholders, `name`, `title`, `data-testid` (71 in src) and ARIA roles (`dialog`, `menuitem`, `option`, `tab`, `checkbox`, `button`).
- Stories: `Document` wrapper around each; `packages/storybook/.storybook/preview.tsx` mounts `BrowserRouter` → `MedplumProvider(MockClient)` → `MantineProvider(theme preset)` + `Notifications`; a `sinon` fake clock (`2020-05-04 12:05`) freezes `MockClient` seeding timestamps; `stories/MockDateWrapper` + `withMockedDate` decorator for time-relative stories; fixtures `covid19.ts`, `healthgorilla.ts`, `labPanel.ts`, `referenceLab.ts` (Mantine-free).

### 1.6 Adjacent packages (scope boundary)

`@medplum/react-scheduling` (19 files import `@mantine/core`, peer-depends on `@medplum/react`) and `packages/app` (the Medplum admin app) are the other Mantine consumers. `dosespot-react`, `health-gorilla-react`, `scriptsure-react` do not import Mantine directly. Scheduling is **out of scope for v1** (documented as a follow-on).

## 2. shadcn state of the world (Sept 2026) that changes the design

1. **CLI v4 registry**: `registry.json` (`items[]`, `include[]` for composition) and `registry-item.json` with types `registry:ui|component|block|lib|hook|page|file|style|theme|base|font|item`; `dependencies` (npm, pinnable `name@version`), `registryDependencies` (bare = official shadcn item; `@ns/name` = namespaced registry; `owner/repo/name` = GitHub registry; URL; local path), `files[].target` with `@components/ @ui/ @lib/ @hooks/` placeholders, `cssVars.{theme,light,dark}`, `css`, `docs`, `categories`, `meta`. `shadcn build` emits static `public/r/<name>.json`; `shadcn view/list/search/add <url|path>` and `--dry-run` support local testing.
2. **Import rewriting is exact and known** (`packages/shadcn/src/utils/transformers/transform-import.ts`): registry source may import `@/components/ui/<x>` → `aliases.ui`, `@/components/<x>` → `aliases.components`, `@/hooks/<x>` → `aliases.hooks`, `@/lib/<x>` → `aliases.lib`, `@/lib/utils` (`cn`) → `aliases.utils`; the `@/registry/<style>/{ui,components,lib,hooks}` forms are equivalent. Consumer aliases beginning with `#` (seen-ehr's `#src/*` convention) are normalized too. Vercel's AI Elements registry (`registry:component`, `target: components/ai-elements/<name>.tsx`, `registryDependencies: ["button","tooltip"]`, `dependencies: ["ai","lucide-react"]`) is the closest published precedent and is what seen-ehr already vendored.
3. **GitHub repositories are registries** (public since June 2026, private since Aug 2026): `registry.json` at repo root + source files → `pnpm dlx shadcn@latest add <owner>/<repo>/<item>`; private repos resolve through `gh` credentials or `GH_TOKEN` (fine-grained PAT, Contents: read). Zero hosting for internal use.
4. **Base UI is the default primitive library** since July 2026; Radix remains fully supported and every official component ships for both (except Base-UI-only ones). Styles are `new-york-v4` (Radix), `radix-nova`, `base-nova`. The official `combobox` item is `@base-ui/react`-based *in every style* (Radix has no combobox) and exposes `ComboboxChips/ComboboxChipsInput/ComboboxEmpty/ComboboxList` — a close structural match to Mantine `Combobox` + `PillsInput` used by `AsyncAutocomplete`. React Aria variants also appear in docs tabs.
5. **Official items that map directly onto Medplum's Mantine usage** (all in `ui.shadcn.com/r/index.json`): `field` (= `Input.Wrapper`), `native-select` (= `NativeSelect`), `input`, `textarea`, `checkbox`, `radio-group`, `switch`, `button`, `button-group`, `badge`, `alert`, `card` (= `Paper/Panel`), `table`, `tabs`, `dialog`, `alert-dialog`, `dropdown-menu` (= `Menu`), `popover`, `tooltip`, `command` (= `Spotlight`), `combobox`, `scroll-area`, `skeleton`, `spinner` (= `Loader`), `kbd`, `separator` (= `Divider`), `pagination`, `avatar`, `collapsible` (= `Collapse`), `toggle-group` (= `SegmentedControl`/`Chip`), `sonner` (= `notifications`), `sidebar` (= `AppShell`/`Navbar`), `sheet`, `item`, `empty`, `input-group`, `attachment`, `message`/`message-scroller` (chat), `progress`. Missing: **stepper** (QuestionnaireForm pages) and **ring progress** (MeasureReportDisplay) — small custom items. Name collision to avoid: official `questionnaire` (a generic agent questionnaire) vs our `questionnaire-form`; namespacing resolves it.
6. **Conventions**: Tailwind v4 (`@theme inline`, OKLCH vars), `data-slot` on every primitive, `React.ComponentProps<...>` instead of `forwardRef`, `size-*` utilities, `cn()` from `clsx`+`tailwind-merge`, cva for variants, `shadcn mcp` works with any registry that has `registry.json`.

## 3. seen-ehr as first consumer (from appendix D)

- Still mounts `MantineProvider` (portal, sidecar ×3, meal-ticket-printer) and imports Mantine CSS first in `@seen/ui/src/styles.css` so Tailwind wins. Its own plan (`thoughts/shared/plans/mantine-to-shadcn-migration.md`) migrated Button/Modal/Menu/etc. and explicitly stalled on the **generic FHIR value display/input** components it still imports from `@medplum/react`: `CodeableConceptDisplay` (6 files), `ResourceTable` (3), `ReferenceDisplay`, `HumanNameDisplay`, `ReferenceInput`, `ResourceAvatar` (2 each), `BackboneElementDisplay/Input`, `AsyncAutocomplete`, `SignInForm`, `QuestionnaireForm` + the item widgets `AttachmentInput`, `CodingInput`, `DateTimeInput`, `QuantityInput`, `ResourcePropertyDisplay`, `CheckboxFormSection`, `FormSection`, plus helpers `getItemAnswerOptionValue`, `getItemInitialValue`, `getNewMultiSelectValues`, `getQuestionnaireItemReference*`, `isQuestionEnabled`, `QuestionnaireItemType`, `killEvent`. `MedplumProvider` is used at 27 sites (23 are test wrappers) and comes from `@medplum/react-hooks` re-export — unaffected.
- Tooling: pnpm, Turborepo, Biome + ESLint (`no-restricted-imports` already redirects Medplum *hooks* to `@seen/react`), `#src/*` imports with `.ts` extensions, `@tabler/icons-react` (no lucide anywhere), Tailwind **3.4.17** with a JS config spread from `@seen/ui/baseTailwindConfig`, React 19.1, TS 6 native preview, **no `components.json`** (AI Elements were hand-vendored into `packages/ui/src/components/ai-elements/<PascalCase>/`), Storybook 10 with `@storybook/addon-vitest` browser mode for `@seen/ui`, Chromatic with one `AllStates` snapshot per file, `SeenMedplumMockClient` (MockClient subclass with `valueSetExpand` faked).
- Seen already has its own shadcn `Combobox` (Radix + cmdk), `Dialog`, `DropdownMenu`, `Tooltip`, `HoverCard`, `Facesheet` (PatientHeader analog), Timeline rows — so the registry's v1 value for Seen is the FHIR-typed layer, not shells.

## 4. Prior art

- Medplum chose Mantine in 2022 after evaluating Tailwind et al. (medplum#1005) and abandoned a headless/Radix experiment the same year (medplum#929, closed). No shadcn/Tailwind issues or PRs exist upstream today. Treat upstreaming as optional, not a design constraint.
- `@medplum/react-hooks` was deliberately made Mantine-free (medplum#3147) — the split we rely on is intentional upstream policy.
- bonFHIR ships render-less `@bonfhir/react` + `@bonfhir/mantine` renderer via a provider; proves the logic/presentation split for FHIR UI but uses runtime injection, the opposite of shadcn's compile-time ownership. We copy the discipline, not the mechanism.
- No community shadcn FHIR registry exists (searches for "medplum shadcn", "medplum tailwind components" returned nothing).

## 5. Risks and gaps found

1. **AsyncAutocomplete** (405 LOC, used by `ValueSetAutocomplete`, `ResourceInput`, `ReferenceInput`, `CodeableConceptInput`, `CodingInput`, `ResourceTypeInput`, `SearchFieldEditor`, `PatientSummary` dialogs) carries the most Mantine behavior (keyboard nav, pills, `creatable`, `maxValues`, debounce, `itemComponent`). Its test helpers are Mantine-DOM-specific. This is the critical-path primitive.
2. **QuestionnaireForm** pagination uses Mantine `Stepper`; no official shadcn stepper — custom item.
3. **AppShell** is structurally Mantine (`AppShell` layout config, `Spotlight`, color scheme). Rebuild on `sidebar` + `command`; API cannot be identical.
4. **Tailwind v3 consumer** (seen-ehr) vs v4 registry. Decision needed (plan D2).
5. **Radix vs Base UI** leaks into component source at trigger sites (`asChild` vs `render`), ~15–18 dirs. Decision needed (plan D1).
6. **Icons**: Medplum and seen-ehr both use `@tabler/icons-react`; shadcn primitives use `lucide-react` internally. Keeping tabler in our components is zero-cost and preserves upstream code.
7. **Fork drift**: 88 react commits between 5.1.17 and 5.1.36. The plan pins a SHA and adds a re-sync procedure; executors must never read the fork's `packages/react`.
8. **License**: Apache-2.0 derived work — keep SPDX headers ("Copyright Orangebot, Inc. and Medplum contributors") on every ported file and carry a NOTICE.
