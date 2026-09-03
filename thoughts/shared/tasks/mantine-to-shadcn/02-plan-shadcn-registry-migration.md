# Plan: `@medplum/react` → shadcn/ui registry (`medplum-shadcn`)

Date: 2026-09-03. Companion to `01-research-medplum-react-shadcn-migration.md` (read it first). Roles: Fable 5.1 = architect (owns decisions, Phase 0, reviews, ledger audits); Grok 4.6 fast / GPT 5.6 sol medium fast = executors (one work unit each, as subagents or cloud agents).

## 1. Goal and non-goals

**Goal.** A shadcn registry whose items are behavior-for-behavior ports of `@medplum/react@5.1.36` components, styled with shadcn/ui + Tailwind, installable per component (`shadcn add seenhealth/medplum/human-name-input`), owned and customizable as source by the consumer. Every ported component is verified by (1) the upstream test suite running green against the port, (2) the upstream stories rendering under identical Storybook IDs so they can be compared 1:1 with `storybook.medplum.com`, (3) a registry install smoke test, and (4) an API parity report.

**Scope of v1 (decided 2026-09-03).** Phases 0–7: every component directory except the shell/auth/chat group — 120 of 125 dirs, 1,097 of 1,359 upstream test cases, 283 of 330 stories. Phase 8 (`AppShell`, `NotificationIcon`, `auth/*`, `GoogleButton`, `chat/*`) is deferred to v2; nothing in Phases 0–7 depends on it.

**Non-goals for v1.** Phase 8 components, `@medplum/react-scheduling`, `packages/app`, pixel parity with Mantine, a compiled npm package (registry-only), Base UI *and* Radix variants (one base), new features, upstreaming.

## 2. Decisions

All decisions below are resolved (user confirmation 2026-09-03, log in §12). Executors treat them as fixed.

| # | Decision | Recommendation | Why |
|---|---|---|---|
| **D0** | Where the code lives | **Inside the `seenhealth/medplum` fork ("origin")**: a new private workspace package `packages/react-shadcn` (`@medplum/react-shadcn`) plus `registry.json` at the repository root. The behavioral reference is `packages/react/src` *in the same tree* at the sync branch's SHA — no separate upstream checkout. Open-sourcing later is a `git subtree split` of the package or simply making the fork public. | User decision 2026-09-03 ("build this in origin"). Zero repo-creation friction; tests run against sibling `@medplum/core`/`react-hooks` *source* through the monorepo's `aliases.mjs`; executors diff against `packages/react` with plain `git diff`; GitHub-registry mode only needs `registry.json` at the fork root. Cost: npm workspaces + a heavier install than a standalone repo. |
| **D1** | Primitive base | **Radix** (`shadcn init -d --base radix`, style `new-york`/`radix-nova`) for v1. | seen-ehr (first consumer) is Radix; executor models are far more reliable with the `asChild` API; every official item still ships for Radix; the only Base-UI-only item we need (`combobox`) ships as `@base-ui/react` in Radix styles too. Base UI variant later via the `{style}` URL placeholder if demand appears (delta ≈ 15–18 dirs with trigger sites). |
| **D2** | Tailwind | **v4 only.** | shadcn CLI v4 items (`cssVars.theme`, `data-slot`, `size-*`) assume v4. seen-ehr's v3.4 → v4 upgrade is an adoption prerequisite (mechanical `@tailwindcss/upgrade`), tracked in §11, not a registry constraint. |
| **D3** | Distribution | **GitHub registry first** (`pnpm dlx shadcn@latest add seenhealth/medplum/<item>`; private repo works via `gh auth`/`GH_TOKEN`). `shadcn build` output (`packages/react-shadcn/public/r`) + static hosting gives a hosted namespace (`@medplum-shadcn`) when the fork goes public. npm package deferred. | Zero infrastructure for internal use; cross-item `registryDependencies` use the `seenhealth/medplum/<item>` form, which stays valid when served over HTTP. |
| **D4** | Item taxonomy | FHIR components = `registry:component` → `components/medplum/<kebab>.tsx`; multi-file features = `registry:block` → `components/medplum/<feature>/*.tsx`; pure TS = `registry:lib` → `lib/medplum/*.ts`; hooks = `registry:hook` → `hooks/medplum/*.ts`; the few primitives shadcn lacks (`stepper`, `ring-progress`, `notify`) = `registry:ui` → `components/ui/*.tsx`. shadcn primitives are bare `registryDependencies` (`"field"`, `"native-select"`, …), never vendored into our items. | Mirrors Vercel AI Elements exactly (`registry:component`, `target: components/ai-elements/<name>.tsx`), which seen-ehr already consumes. |
| **D5** | Public API | **Behavior props stay, presentation becomes composition.** Keep every exported symbol name and every *data/behavior* prop unchanged: FHIR values (`value`, `defaultValue`, `resource`, `questionnaire`, `search`…), schema plumbing (`path`, `valuePath`, `outcome`, `property`, `name`, `disabled`, `required`), callbacks (`onChange(value, propName?)`, `onSubmit`, `onClick`, `loadOptions`, `toOption`…), and behavior switches (`checkboxesEnabled`, `hideToolbar`, `maxValues`, `creatable`, `disablePagination`…). Rewrite *presentational* API the shadcn way: chrome and slots become composed sub-components with `data-slot` and `className` (`Panel`→`Card`-style `Panel/PanelHeader/PanelContent`; `Modal title/actions`→`Modal/ModalHeader/ModalTitle/ModalBody/ModalFooter`; `FormSection title/description`→`FormSection/FormSectionLabel/FormSectionDescription/FormSectionError`; `TimelineItem popupMenuItems`→`TimelineItemMenu` child; `AsyncAutocomplete label/description/error/leftSection`→wrapped in `Field` by the caller), Mantine-typed prop bags (`PaperProps`, `TextProps`, `AnchorProps`, `BadgeProps`, `ButtonProps`, `ModalProps`, `TextareaProps`, `AvatarProps`, `AlertProps`, `TabsProps`, `ComboboxProps`, `ContainerProps`, `PasswordInputProps`, `ElementProps`) become `React.ComponentProps<'div'|'a'|'button'|…>` + cva `variant`/`size`, color-name props (`StatusBadge` colors, `AppShellAnnouncement.color`) become cva variants. Render-props that render *one item of a generic collection* (`itemComponent`, `pillComponent`, `emptyComponent`, `renderCell`, `getMenu`) stay as render-props — that is also shadcn's idiom (`ComboboxList` render function). Every change is recorded in `docs/migration/<item>.md`. | The user asked for idiomatic shadcn over Mantine-shaped prop bags; composition keeps consumer ownership meaningful (they restyle a slot by editing one sub-component). Behavior props are what the upstream tests exercise, so parity stays measurable. |
| **D6** | Evidence | Six verification layers (§7) with a machine-readable ledger; a component is "done" only when all six are green or each red is documented. | The user's requirement: behavior verifiable per component. |
| **D7** | Icons | Keep `@tabler/icons-react` in our items (lucide stays inside shadcn primitives). | Upstream and seen-ehr both use tabler; zero churn. |
| **D8** | Theme | shadcn semantic tokens only (`bg-background`, `text-muted-foreground`, `border-border`, …); dark mode by `.dark` class; one optional `registry:theme` item `medplum-theme` approximating Medplum's palette for demos. | Consumers own the look; components must not carry palette. |
| **D9** | Hooks/data | Depend on published `@medplum/core`, `@medplum/react-hooks`, `@medplum/fhirtypes` (pinned, bumped with upstream sync); never vendor them. `@medplum/mock` + `@medplum/definitions` are dev-only. | They are Mantine-free by upstream policy. |
| **D10** | Repo tooling | The fork's own conventions: npm workspaces, Node 22.22+, TypeScript, ESLint (`@medplum/eslint-config`) + Prettier (single quotes, semicolons, 120 cols), Vitest with `medplumAliases` (jsdom project for ported tests + browser project for stories), a package-local Storybook 10 `react-vite` config (Tailwind v4 via `@tailwindcss/vite`), Playwright, turbo `test`/`lint`/`build` tasks. | Ported files diff cleanly against `packages/react`; nothing new for the fork's CI to learn. |
| **D11** | Licensing | Apache-2.0; every ported file keeps the upstream SPDX header and adds the Apache §4(b) modification notice line; repo carries `NOTICE`. | Legal requirement for derived work. |
| **D12** | Fork branching | `main` stays untouched. The sync branch `cursor/upstream-main-5-1-36-a44b` sits at upstream `main` (`0e501215d`, pushed 2026-09-03). Code branches (`cursor/react-shadcn-<phase>-a44b`) branch off the sync branch and open draft PRs *based on the sync branch* so diffs show only our changes. Nothing is rebased until the very end, when everything is assembled into one Graphite stack `main ← upstream-sync ← docs ← phase0 ← …`. | User instruction 2026-09-03: pull latest on a branch, branch off it, stack at the very end. |

## 3. Target architecture

### 3.1 Repository layout (D0: inside the fork)

```
seenhealth/medplum (fork, branch off cursor/upstream-main-5-1-36-a44b)
├─ registry.json                 generated by packages/react-shadcn/scripts/build-registry.ts; MUST live at the repo root (GitHub-registry mode)
├─ packages/react/src/           the behavioral reference — read-only for this work, diffed with `git diff <old-sha> <new-sha> -- packages/react/src`
└─ packages/react-shadcn/        @medplum/react-shadcn (private workspace package)
   ├─ components.json            shadcn config: style new-york, base radix, rsc false, tsx true,
   │                             aliases { components "@/components", ui "@/components/ui", lib "@/lib", hooks "@/hooks", utils "@/lib/utils" }; run the CLI with `-c packages/react-shadcn`
   ├─ src/
   │  ├─ components/ui/          shadcn primitives installed by the CLI (never hand-edited) + our custom registry:ui items
   │  │                          (stepper.tsx, ring-progress.tsx, notify.tsx)
   │  ├─ components/medplum/     one file per single-file item: human-name-input.tsx, human-name-input.test.tsx, human-name-input.stories.tsx
   │  │  └─ questionnaire-form/  multi-file blocks keep upstream file structure in kebab-case
   │  ├─ lib/utils.ts            cn()
   │  ├─ lib/medplum/            outcomes.ts, date.ts, dom.ts, pagination.ts, app.ts, script.ts, recaptcha.ts, notify.ts
   │  ├─ hooks/medplum/          use-debounced-callback.ts, use-local-storage.ts, use-resize-observer.ts (only what Mantine hooks provided)
   │  ├─ styles.css              @import "tailwindcss" + shadcn tokens (light/dark) + @source for src/
   │  ├─ test/                   setup.ts (port of packages/react/src/test.setup.ts), render.tsx (no MantineProvider), autocomplete.ts (new helpers), mocks/
   │  └─ stories/                decorators.tsx (withMockedDate, MockDateWrapper), fixtures/ (covid19, healthgorilla, labPanel, referenceLab)
   ├─ registry/items.ts          typed source of truth: name, type, title, description, files, dependencies, registryDependencies, categories, meta.upstreamDir, meta.storyIds
   ├─ scripts/                   build-registry.ts, upstream-diff.mjs, registry-smoke.mjs, parity-report.ts, story-matrix.mjs, compare-stories.mjs, ledger.mjs, inventory.mjs
   ├─ ledger.json + MIGRATION_STATUS.md   evidence ledger (generated table)
   ├─ docs/translation-guide.md  §5 of this plan, kept current
   ├─ docs/porting-rules.md      §4 of this plan
   ├─ docs/migration/<item>.md   per-item API deltas (D5)
   ├─ .storybook/                main.ts (react-vite, @tailwindcss/vite, addon-docs, addon-vitest, dark-mode toggle), preview.tsx
   ├─ vitest.config.ts           medplumAliases + `@` alias; projects: unit (jsdom) and storybook (browser)
   └─ package.json               scripts: test, test:stories, lint, typecheck, storybook, registry:build, registry:smoke, parity, ledger
```

CI: the fork's existing `build.yml` runs turbo `build`/`test`/`lint` over `packages/*`, so the new package is covered by adding the turbo tasks; a small extra job runs `registry:build --check` and `registry:smoke`.

Naming rule: upstream dir `PascalCase` → item/file `kebab-case`; exported identifiers unchanged. `Medplum/<Name>` story titles unchanged so IDs match appendix B.

### 3.2 Import conventions inside registry source (verified against the CLI transformer)

| Import in our source | Consumer rewrite (from `components.json` aliases) |
|---|---|
| `@/components/ui/button` | `aliases.ui` |
| `@/components/medplum/form-section` | `aliases.components` |
| `@/lib/medplum/outcomes` | `aliases.lib` |
| `@/hooks/medplum/use-debounced-callback` | `aliases.hooks` |
| `@/lib/utils` (`cn`) | `aliases.utils` |
| `@medplum/core`, `@medplum/react-hooks`, `@tabler/icons-react`, `react`, … | untouched (npm `dependencies`) |

Never import `radix-ui`/`@base-ui/react`/`cmdk` directly in `components/medplum/*`; go through `@/components/ui/*` so the base choice stays inside primitives.

### 3.3 Registry item shape (example)

```json
{
  "name": "human-name-input",
  "type": "registry:component",
  "title": "HumanNameInput",
  "description": "Edit a FHIR HumanName (use, prefix, given, family, suffix) with OperationOutcome error mapping.",
  "files": [{ "path": "packages/react-shadcn/src/components/medplum/human-name-input.tsx", "type": "registry:component", "target": "components/medplum/human-name-input.tsx" }],
  "dependencies": ["@medplum/core@5.1.36", "@medplum/fhirtypes@5.1.36"],
  "registryDependencies": ["input", "native-select", "field", "seenhealth/medplum/form-section", "seenhealth/medplum/elements-context", "seenhealth/medplum/outcomes"],
  "categories": ["fhir", "input", "datatype"],
  "meta": { "upstreamDir": "HumanNameInput", "storyIds": ["medplum-humannameinput--basic", "medplum-humannameinput--disabled", "medplum-humannameinput--partially-disabled"] }
}
```

Tests and stories are *not* listed in `files[]`; they ship in the repo for verification only.

### 3.4 Dependency graph (what must exist before what)

```
lib/medplum/*  ─┐
form-section   ─┼─► leaf inputs/displays ─► autocomplete family ─► form engine (ResourcePropertyInput …) ─► ResourceForm/Table/History/Diff
panel/document ─┘                                  │                                    │
                                                   └─► SearchControl family ◄───────────┘
                                                   └─► QuestionnaireForm/Builder/ResponseDisplay
timeline ◄ resource-timeline ◄ patient/encounter/service-request timelines      patient-summary (uses autocomplete + form + dialog)
sidebar+command ─► app-shell ─► notification-icon, link-tabs                    auth/* (standalone)     chat/* (standalone)
```

## 4. Behavior-preservation rules (binding for every executor)

1. **Logic is copied, not rewritten.** State, effects, memoization, callbacks, helper functions, constants, and control flow come from `upstream/packages/react/src/<Dir>` unchanged. Only imports, JSX, and CSS change. If a Mantine primitive supplied behavior (Combobox keyboard handling, Stepper paging, Menu focus), the shadcn primitive supplies it; do not hand-roll unless no primitive exists (then write it once as a `registry:ui` item).
2. **Preserve the DOM contract the tests and stories rely on**: exported names; data/behavior prop names and semantics (D5); `data-testid`; `name`; `placeholder`; label text and `htmlFor` association; `title`; `aria-label`; text content; ARIA roles (`dialog`, `menuitem`, `option`, `tab`, `checkbox`, `button`, `link`); uncontrolled `defaultValue` semantics; `||` vs `??`; callback signatures (`onChange(value, propName?)`); read-only tooltips ("Read Only"). Presentational API follows D5 composition; the rendered text, roles and test ids those props produced must still appear.
3. **Tests first.** Copy `<Dir>/*.test.tsx` from `upstream/` before writing the component; they must fail for the right reason, then pass. Allowed edits: the `render` import path; replacing Mantine-DOM-specific queries with the new autocomplete helpers; `vi.mock` paths; rewriting the *render call* (never the assertions) to the item's composition API when D5 changed it, e.g. `<Modal title="X">` → `<Modal><ModalHeader><ModalTitle>X</ModalTitle></ModalHeader>…`. Every other edit or `test.skip` is recorded in `ledger.json` with a reason. Target ≥ 95% of upstream cases passing per component; the remaining ≤ 5% must be justified as Mantine-DOM-only assertions.
4. **Stories second.** Copy `<Dir>/*.stories.tsx`; keep `title` and export names identical; swap `Document` import; keep `withMockedDate`/fixtures. New states are not added.
5. **No Mantine leftovers**: CI fails on any `@mantine` import, `*.module.css`, or `--mantine-` string under `src/`. CSS-module classes become Tailwind utilities; `--mantine-color-dimmed` → `text-muted-foreground`, `--mantine-spacing-md` → `p-4`/`gap-4`, `light-dark()` → `dark:` variants, breakpoints → `md:`. Appendix C §C.5 suggests a `--mantine-*` variable shim for the 36 small CSS modules; we do not take it, because a shim leaks Mantine variable names into files consumers own. The eight large modules (Navbar 253 LOC, AIRealTimeQuestionnaireForm 191, ListWithDetailPane 123, HeaderDropdown 107, BaseChat 104, Spotlight 90, CalendarDateInput 86, QuestionnaireBuilder 76) get deliberate translations reviewed by the architect.
6. **No additions**: no new features, behaviors, refactors of logic, abstractions, or comments beyond upstream's. Composition sub-components required by D5 are not "additions"; a new *behavior* prop is. `docs/migration/<item>.md` is the only place for commentary.
7. **Provenance**: keep the two upstream SPDX lines; add one line `// Modified from @medplum/react 5.1.36 <path> for medplum-shadcn (Apache-2.0 §4(b) notice)`.
8. **Icons** stay `@tabler/icons-react`; **notifications** go through `notify()` from `lib/medplum/notify.ts` (sonner); **links** go through `MedplumLink` where upstream did.
9. **Executors read `packages/react/src` only at the branch's SHA and never modify it**; the fork's stale `main` is irrelevant.

## 5. Translation guide (Mantine 8 → shadcn/ui, Radix base)

Executors apply these recipes mechanically; the architect extends the guide when a new pattern appears (the guide is a living file, `docs/translation-guide.md`).

**Composition rule (D5).** When an upstream component takes presentational props, expose the same parts as sub-components instead, following the shadcn pattern (`Card/CardHeader/CardTitle/CardContent`): each part is a `function Xyz({ className, ...props }: React.ComponentProps<'div'>)` with `data-slot="xyz"` and `cn()`; the root keeps the upstream component name. The reference implementations land in WU-03:

```tsx
// upstream                                         // medplum-shadcn
<Panel width={600} fill>…</Panel>                    <Panel className="max-w-[600px]"><PanelContent className="p-0">…</PanelContent></Panel>
<Modal opened onClose title="Edit" size="lg">        <Modal open onOpenChange size="lg">
  <Stack>…</Stack>                                     <ModalHeader><ModalTitle>Edit</ModalTitle></ModalHeader>
  <Group justify="flex-end"><Button/></Group>          <ModalBody>…</ModalBody>
</Modal>                                               <ModalFooter><Button/></ModalFooter>
                                                     </Modal>
<FormSection title description withAsterisk           <FormSection outcome={outcome} errorExpression={…}>
  outcome errorExpression htmlFor>                     <FormSectionLabel htmlFor required>title</FormSectionLabel>
  {children}                                           <FormSectionDescription>description</FormSectionDescription>
</FormSection>                                         {children}
                                                       <FormSectionError />
                                                     </FormSection>
<TimelineItem popupMenuItems={<Menu.Item/>}>          <TimelineItem resource profile dateTime>
                                                       <TimelineItemMenu><DropdownMenuItem/></TimelineItemMenu>…
```

Behavior props (`outcome`, `errorExpression`, `resource`, `open`/`onOpenChange`) stay on the root; the engine's internal call sites (`ElementsInput`, dialogs) are updated to the composed form as part of the same WU. Render-props over generic collections stay render-props.

| Mantine | shadcn / Tailwind | Notes |
|---|---|---|
| `<Group gap="xs" grow wrap="nowrap">` | `<div className="flex flex-nowrap gap-2 *:flex-1">` | `gap="xs"`→`gap-2`, `sm`→`gap-3`, `md`→`gap-4`; `justify="space-between"`→`justify-between`; `align="center"`→`items-center` |
| `<Stack gap="md">` | `<div className="flex flex-col gap-4">` | |
| `<Box>`, `<Flex>`, `<Center>`, `<Space h="md">`, `<SimpleGrid cols={2}>`, `<Grid>` | `div` with `flex`/`items-center justify-center`/`h-4`/`grid grid-cols-2 gap-4` | |
| `<Text size="sm" c="dimmed" fw={500} truncate>` | `<p className="text-sm text-muted-foreground font-medium truncate">` | `span` when inline |
| `<Title order={2}>` | `<h2 className="text-xl font-semibold tracking-tight">` | order 1→`text-2xl`, 3→`text-lg`, 4→`text-base` |
| `<Divider />` | `<Separator />` | |
| `<Paper withBorder shadow="sm" radius="sm" p="md">` / `Panel` | `<Card>` (`CardHeader/CardContent`) or `div className="rounded-lg border bg-card shadow-sm p-4"` | `Panel`/`Document`/`Container` become Card-based items |
| `<TextInput label description error required placeholder />` | `<Field data-invalid={!!error}><FieldLabel htmlFor=…>label</FieldLabel><Input aria-invalid … /><FieldDescription/><FieldError>{error}</FieldError></Field>` | `error` string → `FieldError`; keep `name`, `placeholder`, `defaultValue`, `onChange(e.currentTarget.value)` |
| `<Input.Wrapper>` (= `FormSection`) | `Field` + `FieldLabel` + `FieldDescription` + `FieldError` | `withAsterisk` → `<FieldLabel>…<span aria-hidden>*</span>` |
| `<NativeSelect data={[…]} />` | `<NativeSelect><NativeSelectOption value=…>` | keep `data-testid`, `name`, `defaultValue`, `onChange(e.currentTarget.value)` |
| `<Textarea autosize minRows />` | `<Textarea className="field-sizing-content min-h-…" />` | |
| `<Checkbox label />` | `<Field orientation="horizontal"><Checkbox id/><FieldLabel htmlFor/></Field>` | role `checkbox` preserved |
| `<Radio.Group>` / `<Radio>` | `<RadioGroup>` / `<RadioGroupItem>` + `Label` | |
| `<Switch>` | `<Switch>` | |
| `<Button variant="outline"|"subtle"|"light"|"default"|"filled" size="xs" loading>` | `variant="outline"|"ghost"|"secondary"|"outline"|"default" size="sm"`; `loading` → `disabled` + `<Spinner />` child | |
| `<ActionIcon aria-label>` / `CloseButton` | `<Button variant="ghost" size="icon" aria-label>` | keep `title`/`aria-label` |
| `<Anchor href>` | `<a className="text-primary underline-offset-4 hover:underline">` or `MedplumLink` | |
| `<Loader />` / `LoadingOverlay` | `<Spinner />` / absolutely positioned overlay `div` with `Spinner` | |
| `<Alert color="red" title icon>` | `<Alert variant="destructive"><AlertTitle/><AlertDescription/></Alert>` | |
| `<Badge color=…>` / `StatusBadge` | `<Badge variant=…>` + cva map from FHIR status → variant | `DefaultMantineColor` prop becomes `variant`/`className` |
| `<Avatar src radius size>` | `<Avatar className="size-8"><AvatarImage/><AvatarFallback/></Avatar>` | no size prop; Tailwind sizes |
| `<Modal opened onClose title>` | `<Dialog open onOpenChange><DialogContent><DialogHeader><DialogTitle/></DialogHeader>…</DialogContent></Dialog>` | destructive confirms → `AlertDialog` |
| `<Menu>`/`Menu.Target`/`Menu.Dropdown`/`Menu.Item` | `DropdownMenu`/`DropdownMenuTrigger asChild`/`DropdownMenuContent`/`DropdownMenuItem` | role `menuitem` preserved |
| `<Tooltip label>` / `Tooltip.Floating` | `<Tooltip><TooltipTrigger asChild/><TooltipContent/></Tooltip>` | `TooltipProvider` in test render + storybook preview |
| `<Popover>` | `Popover`/`PopoverTrigger`/`PopoverContent` | |
| `<Tabs>`/`Tabs.List`/`Tabs.Tab` | `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` | `LinkTabs` renders `TabsTrigger asChild` around `MedplumLink` |
| `<Pagination total value onChange>` | `Pagination` + `PaginationItem/Link/Previous/Next` (controlled) | |
| `<Table>` | `Table`/`TableHeader`/`TableRow`/`TableHead`/`TableBody`/`TableCell` | |
| `<ScrollArea>` / `ScrollAreaAutosize` | `ScrollArea` | |
| `<Skeleton>` | `Skeleton` | |
| `<Collapse in>` | `Collapsible open` + `CollapsibleContent` | |
| `<Kbd>` | `Kbd` | |
| `<SegmentedControl data value onChange>` | `ToggleGroup type="single"` + `ToggleGroupItem` | |
| `<Chip checked>` | `Toggle pressed` | |
| `<Indicator label>` | `Badge` positioned absolutely (dot/count) | `NotificationIcon` |
| `<Blockquote>` | `<blockquote className="border-l-2 pl-4 italic text-muted-foreground">` | |
| `<Image>` | `<img>` | |
| `<CopyButton>` | `navigator.clipboard.writeText` + `useState` for "copied" | `ResourcePropertyDisplay` |
| `<Stepper active>` | custom `registry:ui` `stepper` (`Stepper`/`StepperStep`/`StepperContent`) | QuestionnaireForm pages |
| `<RingProgress sections>` | custom `registry:ui` `ring-progress` (SVG) | MeasureReportDisplay |
| `Combobox` + `useCombobox` + `PillsInput` + `Pill` | `Popover` + `Command` (cmdk) with `shouldFilter={false}` (options are server-filtered), `onOpenAutoFocus={(e) => e.preventDefault()}` so typing stays in the input, a hand-built pills container (`Badge` with remove button + borderless `<input role="searchbox">`), `ScrollArea` for `optionsDropdownMaxHeight`, `Spinner` in the right section while loading. Alternative if it passes more upstream tests with less code: official `combobox` (`@base-ui/react`, has `ComboboxChips`) | AsyncAutocomplete only; everything else composes AsyncAutocomplete. Behavior that must survive (appendix C §8.2): 100 ms debounce, abort in-flight on keystroke, `loadOptions` identity as cache key, `minInputLength`, Enter-while-loading auto-selects first result, Backspace on empty search removes last pill, `maxValues === 0` fire-and-forget, cap eviction from the front, blur closes and clears search, `$create` sentinel, `AsyncAutocompleteTestIds` |
| `MultiSelect` | `combobox` with `multiple` | SearchFieldEditor, QuestionnaireForm choice |
| `Spotlight` | `CommandDialog` + `CommandInput/List/Group/Item` | AppShell ⌘K |
| `AppShell`/`AppShell.Navbar`/`Header` | `SidebarProvider`/`Sidebar`/`SidebarHeader`/`SidebarContent`/`SidebarGroup`/`SidebarMenu*`/`SidebarInset` + header `div` | API redesign, see WU-30 |
| `useMantineColorScheme` | prop `colorScheme` + `document.documentElement.classList.toggle('dark')` helper in `lib/medplum/app.ts` | |
| `showNotification({ color: 'red', title, message })` / `updateNotification` / `autoClose: false` | `notify.error(title, message)` / `notify.success` / `notify.loading` → `notify.update(id, …)` wrapping sonner `toast` with a stable `id`; `autoClose: false` → `duration: Infinity` | `Toaster` mounted in storybook preview and test render; the three patterns are enumerated in appendix C §C.4 |
| `useDisclosure()` | `useState(false)` + `open/close/toggle` inline | |
| `useDebouncedCallback` / `useLocalStorage` / `useResizeObserver` / `useClipboard` | `hooks/medplum/use-*.ts` (small, tested) | `@medplum/react-hooks` has `useDebouncedValue` only |
| `MantineProvider` in tests/stories | `TooltipProvider` + `Toaster`; nothing else | |
| CSS modules | Tailwind utilities; hover/focus via `hover:`/`focus-visible:`; theme vars via tokens | delete the `.module.css` |

## 6. Executor work-unit template

Every WU is dispatched with this prompt skeleton (fill the brackets from §8):

```
You are porting [Dirs] from @medplum/react 5.1.36 (Mantine, packages/react) to shadcn/ui in packages/react-shadcn of the
seenhealth/medplum fork, on a branch off cursor/upstream-main-5-1-36-a44b. Read packages/react-shadcn/docs/translation-guide.md,
docs/porting-rules.md, and the golden example src/components/medplum/human-name-input.{tsx,test.tsx,stories.tsx} before writing code.
All commands below run from packages/react-shadcn with npm (`npm run <script>`).

Inputs (read-only): packages/react/src/[Dir]/** in this checkout (the sync branch's SHA; never edit them).
Outputs under packages/react-shadcn/: src/components/medplum/[kebab].tsx (+ .test.tsx, .stories.tsx copied and adapted),
registry/items.ts entry, docs/migration/[kebab].md (API deltas or "none"), ledger.json entry; then `npm run registry:build` to refresh the root registry.json.

Steps: 1) copy tests + stories; 2) run `npm test -- [kebab]` (must fail: module missing); 3) port the component following the
guide; 4) `npm test -- [kebab]` green; 5) `npm run typecheck && npm run lint`; 6) `npm run test:stories -- --filter [kebab]`;
7) `npm run registry:build && npm run registry:smoke -- [kebab]`; 8) `npm run parity -- [kebab]` and record every delta;
9) `npm run compare:stories -- [kebab]` and inspect artifacts/[storyId].png; 10) `npm run ledger:update -- [kebab]`;
11) commit per item, open a draft PR based on cursor/upstream-main-5-1-36-a44b titled "port([kebab]): …" whose body pastes the ledger row and test summary.

Done means: ledger row shows tests ≥95% passing (others justified), all stories render, smoke + parity + typecheck + lint green,
no `@mantine` import, no `.module.css`, provenance header present. Do not add props, features, comments, or refactors.
If a behavior cannot be reproduced with the listed primitives, stop, write the blocker into ledger.json `blockers[]`, and
report: what you tried, the failing test names, and the primitive/API you would need.
```

Model routing: mechanical leaf WUs → Grok 4.6 fast; WUs touching dialogs/menus/tables → either; critical-path WUs (WU-03, WU-10–12, WU-15, WU-20, WU-30) → GPT 5.6 sol medium fast with the architect reviewing intermediate commits.

## 7. Verification layers and the ledger

| Layer | Command | Evidence recorded per item |
|---|---|---|
| L1 Ported unit tests (jsdom) | `npm test -- <item>` | `tests.upstream`, `tests.ported`, `tests.passing`, `tests.skipped[] {name, reason}` |
| L2 Stories render (Vitest browser mode via `@storybook/addon-vitest`, Chromium) | `npm run test:stories -- --filter <item>` | `stories.upstream`, `stories.ported`, `stories.passing`, IDs |
| L3 Side-by-side artifact | `npm run compare:stories -- <item>` → `artifacts/<storyId>.png` (left: `https://storybook.medplum.com/iframe.html?id=<id>&viewMode=story`, right: local) | `visual.reviewedBy`, `visual.notes` (architect or vision-model review: same information, same interactions, shadcn look) |
| L4 Registry integrity | `npm run registry:build -- --check` (root registry.json up to date, schema-valid) + `npm run registry:smoke -- <item>` (scratch Vite app in `/tmp`, `shadcn init -d --base radix`, `shadcn add <path-to-item.json>`, `tsc --noEmit`) | `registry.builds`, `registry.installs` |
| L5 API parity | `npm run parity -- <item>` (ts-morph: exported symbols + interface members, `packages/react/src/<Dir>` vs port) → `parity/<item>.md` | `api.removed[]`, `api.changed[]`, each cross-referenced in `docs/migration/<item>.md` |
| L6 Hygiene gates | `npm run typecheck`, `npm run lint`, `npm run check:no-mantine` (`rg "@mantine" src` must be empty), `npm run check:no-css-modules` | booleans |

`MIGRATION_STATUS.md` is regenerated from `ledger.json` and shows one row per upstream dir (125 rows: 124 component/feature dirs + `utils/`; the 5 Phase 8 dirs are marked `deferred-v2`) with phase, WU, executor, PR, and the six layer states. Program-level counters for v1: components done / 120, test cases passing / 1,097 (floor 1,042 = 95%), stories passing / 283. Baselines come from appendix A and B (regenerate with `scripts/inventory.mjs`, `scripts/stories.mjs`, `scripts/wu-sizes.mjs`).

## 8. Phases and work units

Sizes are upstream numbers from appendix A (source LOC / test cases / stories). Parallel WUs within a phase touch disjoint files.

### Phase 0 — Foundation and golden example (architect + 1 executor, sequential)

| WU | Scope | Exit criteria |
|---|---|---|
| WU-00 | Package scaffold in the fork: `packages/react-shadcn` (npm workspace, ESLint/Prettier from the repo), `components.json` (Radix, new-york, Tailwind v4), `shadcn add -c packages/react-shadcn` the primitive set (`button input textarea label field native-select checkbox radio-group switch badge alert card table tabs dialog alert-dialog dropdown-menu popover tooltip command combobox scroll-area skeleton spinner kbd separator pagination avatar collapsible toggle toggle-group sonner sidebar sheet item empty input-group progress`), `src/lib/utils.ts`, `src/styles.css`, turbo tasks, `NOTICE` | `npm run typecheck && npm run lint` green in the package |
| WU-01 | Test + story infra: `src/test/setup.ts` (port of `packages/react/src/test.setup.ts`), `src/test/render.tsx` (`TooltipProvider` + `Toaster`, re-exports), Vitest projects (jsdom + storybook browser) using `medplumAliases`, Storybook 10 `.storybook/` with `MedplumProvider(MockClient)` decorator, frozen clock (`sinon` fake timers as upstream), `BrowserRouter`, dark toggle, `@source` for `src/`; port `stories/decorators.tsx`, `MockDateWrapper*`, fixtures | `npm test` runs 0 tests green; `npm run storybook` boots; `npm run test:stories` runs |
| WU-02 | Pure libs + custom primitives: `lib/medplum/{outcomes,date,dom,pagination,app,script,recaptcha}.ts` with their upstream tests (`utils/`: 626 src LOC, 527 test LOC, 23 cases); `lib/medplum/notify.ts`; `hooks/medplum/use-{debounced-callback,local-storage,resize-observer,clipboard}.ts`; `components/ui/{stepper,ring-progress}.tsx` with tests + stories | all L1/L6 green; items registered |
| WU-03 | Layout + form seams — **the reference implementations of the D5 composition rule**: `container`, `panel`, `document` (Card-based composition `Panel/PanelHeader/PanelContent`), `form-section` (`FormSection/FormSectionLabel/FormSectionDescription/FormSectionError` on shadcn `Field`, keeps `READ_ONLY_TOOLTIP_TEXT` tooltip), `elements-input` + `elements-context` (`ElementsInput/*`, `constants.ts`), `resource-property-input-utils` (`BaseInputProps` etc.), `checkbox-form-section` (6 dirs: 330 src LOC, 131 test LOC, 2 cases, 8 stories), and `modal` (Dialog-based; 103 src LOC, 165 test LOC, 14 cases, 7 stories) because nine later dialogs depend on its exact chrome (appendix C §3.5); `ModalProps` becomes an explicit interface (`opened`, `onClose`, `title`, `size`, `closeOnClickOutside`, `withCloseButton`, `centered`, `fullScreen`, `zIndex`) instead of `Omit<MantineModalProps, …>` (appendix C §C.7) | L1–L6 green; these are `registryDependencies` of everything else |
| WU-04 | **Golden example**: `human-name-display` and `human-name-input` (134 src LOC, 171 test LOC, 6 cases, 4 stories) end-to-end through all six layers; write `docs/translation-guide.md`, `docs/porting-rules.md`, the WU prompt template, `scripts/{build-registry,upstream-diff,registry-smoke,parity-report,story-matrix,compare-stories,ledger,wu-sizes}`, root `registry.json` | `MIGRATION_STATUS.md` shows 2/125 done with all six layers green; artifacts for `medplum-humannameinput--basic|disabled|partially-disabled` and `medplum-humannamedisplay--basic` reviewed |

Sizes below are exact upstream measurements (src LOC / test LOC / test cases / stories) summed per WU by `scripts/wu-sizes.mjs`; the 23 WUs cover all 125 component dirs (1,359 test cases, 330 stories).

### Phase 1 — Display leaves (3 executors in parallel)

| WU | Dirs | src LOC | test LOC | tests | stories | Notes |
|---|---|---|---|---|---|---|
| WU-10 | AddressDisplay, CodeableConceptDisplay, CodingDisplay, ContactDetailDisplay, ContactPointDisplay, IdentifierDisplay, MoneyDisplay, QuantityDisplay, RangeDisplay, RatioDisplay, ReferenceDisplay, FhirPathDisplay | 268 | 411 | 54 | 19 | zero Mantine imports; pure formatters |
| WU-11 | DescriptionList, NoteDisplay, Logo, StatusBadge (`BadgeProps`→variant), ResourceBadge, ResourceName (`TextProps`), ResourceAvatar (`AvatarProps`), UnavailableNote, ErrorBoundary, Loading, OperationOutcomeAlert (`AlertProps`), MedplumLink (`AnchorProps`), ScrollToTop, LinkTabs (`TabsProps`), InfoBar, buttons | 727 | 737 | 53 | 23 | most D5 prop redesigns land here |
| WU-12 | AttachmentDisplay, AttachmentArrayDisplay, AttachmentButton, AttachmentInput, AttachmentArrayInput, SignatureInput (`signature_pad`, `PaperProps`), QrCodeScanner (`jsqr`), CcdaDisplay | 827 | 1,277 | 52 | 12 | optional npm deps declared per item |

### Phase 2 — Simple inputs (3 executors in parallel; depends on Phase 0)

| WU | Dirs | src LOC | test LOC | tests | stories | Notes |
|---|---|---|---|---|---|---|
| WU-13 | AddressInput, AnnotationInput, ContactDetailInput, ContactPointInput, IdentifierInput, MoneyInput, PeriodInput, QuantityInput, RangeInput, RatioInput | 759 | 787 | 37 | 34 | `Group`+`TextInput`+`NativeSelect` recipe only |
| WU-14 | DateTimeInput (+utils), CalendarInput, CalendarDateInput (custom grid), TimingInput (Modal, Chip, Switch), Form/SubmitButton/FormUtils, PasswordInput, SensitiveTextarea | 1,048 | 1,607 | 67 | 16 | keep the hand-rolled `CalendarDateInput` grid (restyle with cva day-cell states); do not swap in shadcn `calendar`/react-day-picker, which lacks `availableDates`/`earliestDate`/drag ranges (appendix C §9.4) |
| WU-15 | **AsyncAutocomplete** (difficulty 5/5, appendix C §8): first inline the Mantine `ComboboxItem` shape (`{ value: string; label: string; disabled?: boolean }`) into `AsyncAutocompleteOption<T>` so the whole family sheds its Mantine type dependency, then rebuild on `Popover`+`Command` + new `src/test/autocomplete.ts` helpers (`typeInAutocomplete`, `clickAutocompleteOption`, `selectAutocompleteOption`) that every downstream test imports | 405 | 542 | 23 | 2 | Critical path; architect pairs. Exit: keyboard (↑↓ Enter Esc, Backspace removes last pill), `creatable`, `maxValues`, `minInputLength`, abort on new input, `itemComponent`/`pillComponent`/`emptyComponent`, `clearable` all covered by green upstream tests |

### Phase 3 — Autocomplete family (2 executors; depends on WU-15)

| WU | Dirs | src LOC | test LOC | tests | stories |
|---|---|---|---|---|---|
| WU-16 | ValueSetAutocomplete, CodeInput, CodingInput, CodeableConceptInput, ResourceTypeInput | 407 | 783 | 30 | 14 |
| WU-17 | ResourceInput (+MultiResourceInput), ReferenceInput | 586 | 567 | 28 | 19 |

### Phase 4 — Schema-driven form engine (1–2 executors, mostly sequential; depends on Phases 2–3)

| WU | Dirs | src LOC | test LOC | tests | stories | Notes |
|---|---|---|---|---|---|---|
| WU-20 | ResourcePropertyDisplay, ResourcePropertyInput (dispatch table), BackboneElementDisplay/Input, ResourceArrayDisplay/Input, SliceDisplay/Input, ExtensionDisplay/Input | 1,704 | 2,359 | 93 | 12 | difficulty 4/5 (appendix C §1): logic is Mantine-free, risk is the large pinned test surface; `ElementsInput` itself lands in WU-03 |
| WU-21 | ResourceForm (+utils), ResourceTable, ResourceHistoryTable, ResourceDiff/Row/Table, ResourceBlame, FhirPathTable | 1,020 | 1,515 | 50 | 27 | ResourceForm has 15 stories incl. US Core profiles |

### Phase 5 — Search and lists (2 executors; depends on Phases 3–4)

| WU | Dirs | src LOC | test LOC | tests | stories | Notes |
|---|---|---|---|---|---|---|
| WU-22 | SearchControl (+Field, +SearchUtils), SearchPopupMenu, SearchFieldEditor, SearchFilterEditor, SearchFilterValueInput/Display/Dialog, SearchExportDialog, BookmarkDialog | 2,495 | 3,158 | 114 | 12 | difficulty 3/5 (appendix C §3): `SearchUtils.tsx` and `SearchControlField.ts` are pure and port untouched |
| WU-23 | ListWithDetailPane, ResourceBoard (`modal` moved to WU-03) | 446 | 337 | 25 | 6 | |

### Phase 6 — Questionnaire (2 executors; depends on Phases 2–4 and `stepper`)

| WU | Dirs | src LOC | test LOC | tests | stories | Notes |
|---|---|---|---|---|---|---|
| WU-24 | QuestionnaireForm (8 files incl. AIRealTimeQuestionnaireForm / `useWhisper`) | 1,718 | 3,819 | 79 | 21 | Critical, difficulty 4/5 (appendix C §2); `useQuestionnaireForm` (react-hooks) carries state; the `stepper` Next button must keep `form.reportValidity()` gating; Kitchen Sink ×3 and Signature Required stories are the acceptance set |
| WU-25 | QuestionnaireBuilder, QuestionnaireResponseDisplay, PlanDefinitionBuilder, RequestGroupDisplay, ReferenceRangeEditor | 1,758 | 2,766 | 67 | 21 | |

### Phase 7 — Timelines and clinical displays (3 executors)

| WU | Dirs | src LOC | test LOC | tests | stories | Notes |
|---|---|---|---|---|---|---|
| WU-26 | Timeline, ResourceTimeline, DefaultResourceTimeline, PatientTimeline, EncounterTimeline, ServiceRequestTimeline | 700 | 570 | 22 | 7 | |
| WU-27 | DiagnosticReportDisplay, MeasureReportDisplay (`ring-progress`), PatientHeader, PatientExportForm, PatientAccountsForm, SmartAppLaunchLink, Scheduler | 1,749 | 1,985 | 73 | 18 | |
| WU-28 | PatientSummary (27 files: section registry, `usePatientSummaryData` wiring, 10 edit dialogs, Pharmacies) | 3,511 | 4,469 | 185 | 1 | difficulty 2/5 (appendix C §5): repetitive dialogs on `modal`; split into 28a sections/registry and 28b dialogs; `PharmacyDialog` needs individual attention |

### Phase 8 — Shell, auth, chat — **deferred to v2** (decision 2026-09-03)

Kept here so the sizing and design notes are not lost; not part of v1's ledger targets. Seen has its own shell and auth; these matter for generic adopters and upstream optionality only.

| WU | Dirs | src LOC | test LOC | tests | stories | Notes |
|---|---|---|---|---|---|---|
| WU-30 | AppShell (7 files) on `sidebar` + `command`, NotificationIcon | 1,690 | 2,022 | 72 | 7 | Critical, difficulty 4/5 (appendix C §4): `AppShell` layout and `Spotlight` have no drop-in; `CommandDialog` + ⌘K listener (~250 new LOC); `SpotlightLinkAction` becomes a standalone type and `AppShellAnnouncement.color` a closed semantic union (`'warning' \| 'error' \| 'info' \| 'success'`) mapped through cva; architect designs the redesigned API before dispatch |
| WU-31 | auth/* (14 files), GoogleButton | 1,707 | 2,038 | 53 | 28 | keep `useLocalStorage`/recaptcha/`MfaForm` QR logic |
| WU-32 | chat/* (11 files) on `message`/`message-scroller`/`attachment` where they fit | 2,045 | 3,417 | 137 | 12 | difficulty 3/5 (appendix C §6): scroll anchoring and replaceable toast ids (`notify` must support `id`) are the risks; `useSubscription`/`useThreadInbox` untouched |

### Phase 9 — Release and adoption

| WU | Scope |
|---|---|
| WU-40 | root `registry.json` final, `shadcn build` → `packages/react-shadcn/public/r` (kept in-repo so a hosted namespace is a static deploy away when the fork goes public), `medplum-theme` item, package README with `shadcn add seenhealth/medplum/<item>` instructions (private: `gh auth login` or `GH_TOKEN`), tag `react-shadcn-v0.1.0+medplum.5.1.36` |
| WU-42 | Fork stack assembly (D12): rebase `cursor/mantine-shadcn-migration-plan-a44b` and any other fork branches onto `cursor/upstream-main-5-1-36-a44b`, submit as one Graphite stack into `main` (`gt s --stack --no-edit --no-interactive`). Done last, on the user's go. |
| WU-41 | seen-ehr adoption spike (§11): `components.json` in `packages/react`, Tailwind v4 upgrade PR, replace the 20 `@medplum/react` component imports listed in research §3 with registry items, `no-restricted-imports` rule for `@medplum/react` components |

## 9. Architect review checklist (per WU PR)

- Ledger row present; L1 ≥ 95% with every skip justified as Mantine-DOM-only; L2 all stories; L4 smoke passes; L5 deltas all documented in `docs/migration/<item>.md`; L6 green.
- Diff of `.tsx` against `packages/react/src/<Dir>`: only imports/JSX/className changed (`scripts/upstream-diff.mjs <item>` shows the logic hunks — expect none).
- Test file diff against upstream: only allowed edits.
- Story file diff: title/exports unchanged.
- No `radix-ui`/`@base-ui/react`/`cmdk` import in `components/medplum/*`; no palette classes (`text-red-500` …) — tokens only; `data-slot` on root elements.
- Artifacts for the item's story IDs viewed; note anything that changes information density or interaction order.

## 10. Upstream sync procedure (ongoing)

1. Merge the new upstream tag into the sync branch (`git merge upstream/main` on `cursor/upstream-main-*`), then restack the code branches.
2. `npm run upstream:diff -- <old-sha> <new-sha>` lists changed files under `packages/react/src` and maps them to items via `meta.upstreamDir`.
3. Re-run the WU template for each affected item with "re-port the diff" instructions; the ported tests from the new version are the acceptance criteria.
4. Bump `@medplum/*` pins in `dependencies` of every item; tag `vX.Y.Z+medplum.<version>`.

## 11. seen-ehr adoption track (separate from the registry; prerequisites only)

- Tailwind v4 upgrade of `@seen/ui`, `@seen/react`, `apps/portal` (`npx @tailwindcss/upgrade`), `baseTailwindConfig.ts` → CSS `@theme`.
- `components.json` in `packages/react` (`aliases.ui` → `@seen/ui/ui`, `components` → `#src/components`, `lib` → `#src/lib`, `hooks` → `#src/hooks`, `utils` → `@seen/ui/cn`); the CLI normalizes `#` aliases. Add kebab-case shadcn primitives under `packages/ui/src/components/ui/` (installed via CLI) alongside the existing PascalCase dirs, or add re-export shims.
- Install order follows research §3: `codeable-concept-display`, `human-name-display`, `reference-display`, `resource-avatar`, `reference-input`, `async-autocomplete` (or keep Seen's `Combobox`), `backbone-element-display/input`, `resource-table`, questionnaire item widgets, `form-section`, `checkbox-form-section`, then `questionnaire-form`; keep `MedplumProvider`/hooks from `@medplum/react-hooks`.
- Extend `frontendRestrictedImportsPaths` with `@medplum/react` component names as they are replaced; remove `MantineProvider` per seen-ehr's own plan Phase 5.

## 12. Decision log (user, 2026-09-03)

| Question | Answer |
|---|---|
| Where the code lives | **Revised 2026-09-03 ("build this in origin")**: inside the `seenhealth/medplum` fork as `packages/react-shadcn`, private now, open-source later (D0). |
| Primitive base | Radix (D1). |
| Name | `medplum-shadcn` everywhere: repo, registry name, future `@medplum-shadcn` namespace. |
| v1 scope | Phases 0–7. Phase 8 deferred to v2. |
| Fork `main` | Do not push to `main`. Sync branch `cursor/upstream-main-5-1-36-a44b` at upstream `main`; fork work branches off it; assemble one stack at the very end (D12). |
| Tailwind | v4 only (D2). |
| Distribution | GitHub registry `seenhealth/medplum/<item>` (D3). |
| Public API | Idiomatic shadcn: composition over presentational props; behavior props preserved (D5 rewritten). |
| Icons, theme, hooks, tooling | As recommended (D7–D10). |

Nothing is blocked on the user. Phase 0 starts on `cursor/react-shadcn-phase0-a44b` (off the sync branch).
