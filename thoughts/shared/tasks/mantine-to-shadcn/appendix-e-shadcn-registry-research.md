# Research: Re-implementing `@medplum/react` as a shadcn/ui registry

Date: 2026-09-03. Sources are dated where the shadcn docs are dynamic/changelog-driven (shadcn/ui ships weekly and materially changed its registry format and default primitives library across 2026).

---

## 1. shadcn CLI v4 registry format (authoritative, current)

Primary sources (all fetched 2026-09-03): [Registry overview](https://ui.shadcn.com/docs/registry), [registry.json](https://ui.shadcn.com/docs/registry/registry-json), [registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json), [Getting Started](https://ui.shadcn.com/docs/registry/getting-started), [Namespaces](https://ui.shadcn.com/docs/registry/namespace), [Examples](https://ui.shadcn.com/docs/registry/examples), [components.json](https://ui.shadcn.com/docs/components-json), [Monorepo](https://ui.shadcn.com/docs/monorepo), [Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4), [Changelog](https://ui.shadcn.com/docs/changelog), [MCP Server](https://ui.shadcn.com/docs/mcp), [GitHub Registries](https://ui.shadcn.com/docs/registry/github-registries).

### `registry.json` schema

Top-level fields: `$schema` (`https://ui.shadcn.com/schema/registry.json`), `name`, `homepage`, `items[]`, and `include[]` (list of relative paths to nested `registry.json` files, used to compose a large registry instead of one giant file — folder shorthand isn't allowed, only explicit file paths). Only the root `registry.json` must define `name`/`homepage`; included files may omit them. `shadcn build` resolves `include` and flattens the output (the built `registry.json` never contains `include`); item file paths in an included file are relative to that file, not the root. Item names must be globally unique across the resolved registry. For our ~128-component library this `include`-based composition (e.g. one `registry.json` per domain area — `display/`, `input/`, `forms/`, `scheduling/`) is the documented pattern for "larger registries."

### `registry-item.json` schema — `type` values

| Type | Purpose |
|---|---|
| `registry:base` | Entire design system/preset payload (style, icon library, colors, fonts, RSC/TSX/RTL flags, dependencies) — see below. |
| `registry:style` | A style variant (e.g. `new-york`), can `extends` shadcn defaults or `extends: "none"` to start from scratch. |
| `registry:theme` | A theme (CSS vars, colors) without full style config. |
| `registry:block` | Complex, usually multi-file components (dashboards, login forms). |
| `registry:component` | Simple, usually single-purpose components. |
| `registry:ui` | UI primitives / single-file components — this is the closest fit for most Medplum display/input atoms (`HumanNameDisplay`, `AddressInput`, etc.). |
| `registry:lib` | Libs and utils (non-React logic, formatters, FHIR helpers). |
| `registry:hook` | React hooks. |
| `registry:page` | Page or file-based route files; **requires** `target`. |
| `registry:file` | Miscellaneous/config files (e.g. `.env`); **requires** `target`. |
| `registry:font` | Font metadata (`family`, `provider`, `import`, `variable`, `dependency` for non-Next projects). |
| `registry:item` | "Universal" registry item — used for cross-framework/non-component resources. |

Other fields:
- **`author`** — free text, per-item or registry-wide.
- **`dependencies` / `devDependencies`** — plain npm package names, optionally pinned `name@version` (e.g. `"zod@^3.20.0"`, `"is-even@3.0.0"`). This is exactly where we'd put `@medplum/core`, `@medplum/react-hooks`, `signature_pad`, `jsqr`.
- **`registryDependencies`** — references to *other registry items* (not npm packages). Forms are: bare name for the built-in shadcn registry (`"button"`); `@namespace/item-name` for namespaced registries (`"@medplum/human-name-display"`); `owner/repo/item-name[#ref]` for public/private GitHub registries; a full URL (`"https://example.com/r/foo.json"`); or a local file path (`"./foo.json"`) for local dev. Bare names always mean "the built-in shadcn item," never same-repo items — same-repo cross-references must use the full `owner/repo/item` GitHub address or the namespace form. Resolution is recursive, topologically sorted, deduplicated by target path (last one wins — this is also the documented mechanism for consumers to override/patch one of our components), and dependencies are NOT transitively version-pinned (pin GitHub deps to a tag/SHA if reproducibility matters).
- **`files[]`** — each entry has `path` (registry source path, used by `shadcn build`), `type`, and optional `target`. `target` is **required** only for `registry:page`/`registry:file`; for everything else the CLI derives the destination from the consumer's `components.json` aliases. `~` refers to the consumer project root (e.g. `~/.env`). New (2026) **target placeholders** — `@components/`, `@ui/`, `@lib/`, `@hooks/` — let a file target a shadcn-configured directory without hardcoding `src`/`components`/monorepo package paths; anything after the placeholder is preserved (`@ui/ai/prompt-input.tsx` → user's configured `ui` dir + `ai/prompt-input.tsx`). `target` can point a file to a *different* shadcn directory than its declared `type` (e.g. a `registry:ui` file targeted at `@lib/`). `@utils/` is not supported (utils is a file alias, not a directory).
- **`tailwind`** — deprecated in favor of `cssVars.theme` on Tailwind v4 projects; still usable for `theme.extend`/`plugins`/`content` on v3 projects.
- **`cssVars`** — `{ theme, light, dark }`. `theme` maps to Tailwind v4 `@theme` tokens (fonts, radii, etc. — not light/dark-dependent); `light`/`dark` map to CSS custom properties toggled by the `.dark` class. Values can be raw HSL triples (`"20 14.3% 4.1%"`) or full color functions (`"oklch(0.205 0.015 18)"`) — the 2026 default style uses OKLCH.
- **`css`** — arbitrary CSS injected into the project's global CSS file, keyed by target block: `@layer base`, `@layer components`, `@utility <name>`, `@keyframes <name>`, `@plugin <name>`. Useful for shipping a `@plugin @tailwindcss/typography`-style dependency or custom utilities alongside a component.
- **`envVars`** — dev/example env vars merged into `.env`/`.env.local` (existing values are not overwritten); explicitly **not** meant for production secrets. Relevant if a Medplum-derived component needs a default FHIR server base URL for local dev.
- **`font`** — required only for `registry:font` items.
- **`docs`** — a message shown to the user on install (e.g. "read Medplum's FHIR terminology docs before using ValueSetAutocomplete").
- **`categories`** — free-form tags for organizing/search (`["forms", "scheduling"]`).
- **`meta`** — arbitrary key/value bag for anything else (could carry a Medplum FHIR resource-type mapping, Storybook story id, etc., for our own tooling).

### `shadcn build` and hosting

`pnpm dlx shadcn@latest build` reads the source `registry.json` (resolving `include`) and emits one static JSON file per item plus a `registry.json` catalog into an output dir (default `public/r`, override with `--output`). Hosting is then just "serve static files over HTTP" — Next.js, Vite+any static host, S3, etc. all work; the doc explicitly states the registry "works with any project type and any framework... is not limited to React" as long as it serves JSON. Item URLs follow the `{name}.json` convention: `https://acme.com/r/button.json`. As an alternative to prebuilding, `shadcn` (as a runtime npm dependency) exposes `loadRegistry()`/`loadRegistryItem()` producer-side loader APIs for dynamic route handlers (Next.js `app/r/[name].json/route.ts`) that resolve `include` at request time without a build step — useful if we want the registry payload to be generated live from source (e.g. always in sync with the monorepo).

Namespacing: consumers configure `components.json` → `registries: { "@medplum": "https://r.medplum.dev/{name}.json" }` (or an object form with `headers`/`params` for auth), then run `npx shadcn add @medplum/human-name-display`. The `{name}` placeholder is required; an optional `{style}` placeholder lets a single URL template serve different files per consumer style/base config (e.g. serving a Base UI vs Radix variant of the same item — see §Radix/Base UI below). Auth: header/param values support `${ENV_VAR}` expansion from `process.env`, resolved per-registry so different registries can have independent credentials; the CLI never logs values. As of August 2026, **public and now private GitHub repos** are also directly addressable as registries (`owner/repo/item-name`) with zero config if the user has `gh auth login`, or via `GH_TOKEN`/`GITHUB_TOKEN` in CI — this is a second, lower-friction distribution channel we could offer in parallel to a hosted namespace (e.g. `medplum/medplum-shadcn/human-name-display`).

### Import alias resolution

Registry source files should use canonical import paths `@/registry/[style]/...` (per the Getting Started guidance: *"Imports should always use the `@/registry` path"*), organized under `components/`, `hooks/`, `lib/` subfolders. On `add`, the CLI's `transformImport`/`updateImportAliases` step (confirmed from [shadcn-ui/ui source](https://github.com/shadcn-ui/ui/blob/15ac1be9/packages/shadcn/src/utils/transformers/transform-import.ts)) rewrites these at the AST level using the consumer's `components.json#aliases`:

| Canonical registry import | Rewritten to |
|---|---|
| `@/registry/[style]/ui/*` | `aliases.ui` (fallback `aliases.components/ui`) |
| `@/registry/[style]/components/*` | `aliases.components` |
| `@/registry/[style]/lib/*` | `aliases.lib` |
| `@/registry/[style]/hooks/*` | `aliases.hooks` |
| `@/lib/utils` (specifically the `cn` import) | `aliases.utils` |
| bare `@/registry` | `aliases.components` |

It also normalizes alternate prefixes (`#registry`, `#/registry`) to the canonical `@/` form first, so registries authored with either `@/` or `#/` internal aliases work once translated — but we should standardize on `@/registry/...` per the official guidance. This means: **yes**, registry source files can and should import from `registry/...`-shaped paths; the CLI's whole job is rewriting those into whatever the consuming project's `components.json` says (`@/components/ui`, `~/components/ui`, `@workspace/ui/components`, etc.), independent of the consumer's own path-alias scheme.

### Monorepo support

There is no single `--monorepo` flag on `add`; instead, **every workspace that owns or consumes components needs its own `components.json`**, and you invoke the CLI *from* (or with `--cwd` pointed at) the workspace, not the repo root ([Monorepo docs](https://ui.shadcn.com/docs/monorepo)). `shadcn init` does have `--monorepo`/`--no-monorepo` to scaffold a new monorepo project structure. Pattern for a pnpm workspace with a shared `packages/ui`:
- `packages/ui/components.json` — `aliases` point at the package's own internal paths (e.g. `"components": "@workspace/ui/components"`), so files added *into* that package get package-local imports.
- `apps/web/components.json` — `aliases.ui`/`aliases.components` point at `@workspace/ui/components` (the shared package's exported subpath), so `shadcn add` run from the app resolves a `registryDependencies` reference to the shared component instead of duplicating it into the app.
- Tailwind v4: leave `tailwind.config` empty in `components.json` (config lives in CSS, not JS).
- `package.json#imports` (the `#foo` self-reference field) works for **package-local** aliases inside one workspace; **cross-workspace** shared imports (`@workspace/ui/components`) must be explicit `components.json` aliases, resolved via the shared package's `exports` map — the target package must actually `export` any path another workspace will reference. `shadcn eject -c packages/ui` is the command to eject/scaffold into a specific workspace path.

This maps directly onto our `packages/ui` (shadcn primitives) vs a hypothetical `packages/fhir-components` (Medplum-derived, depends on `@medplum/core`) split, if we want the registry to install into the seen-ehr monorepo the same way it installs into any pnpm workspace.

### `registry:base` and presets (2026)

`registry:base` shipped alongside the March 2026 "shadcn/cli v4" release ([changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4); details from [Examples](https://ui.shadcn.com/docs/registry/examples) and a third-party writeup, [shadcnstudio.com](https://shadcnstudio.com/blog/shadcn-cli-v4-registry-base-and-registry-font/)). A `registry:base` item is "a complete design system base" consumed via `npx shadcn init http://your-domain/r/base.json` (or as a preset id). Its unique `config` field is effectively a partial `components.json`: `style`, `iconLibrary`, `rsc`, `tsx`, `rtl`, `menuColor`, `menuAccent`, `tailwind.baseColor`/`.css`/`.prefix`, `aliases.{components,utils,ui,lib,hooks}`, and `registries` (to pre-wire third-party namespace URLs). shadcn's own registry generates ~10+ presets this way (`radix-vega`, `radix-nova`, `base-nova`, etc. — combinations of base library × style × icon set × font), each a `buildRegistryBase()`-produced `registry:base` payload with `extends: "none"` when it doesn't inherit shadcn defaults.

**Should we ship one?** Yes, as a convenience, but it is optional and orthogonal to shipping the component items themselves. A `registry:base` item is the right vehicle for: pinning `aliases.ui`/`aliases.hooks` to whatever paths our components expect, pre-registering our own namespace plus any registries we depend on (e.g. if we split display/input logic into a separate namespace from styling), and setting a baseColor/OKLCH theme matched to Seen/Medplum branding. It should **not** be used to fork visual styling per "archetype" — a GitHub discussion ([shadcn-ui/ui#10269](https://github.com/shadcn-ui/ui/discussions/10269)) documents that `registry:base` is for project scaffolding (colors/fonts/icons/config), not per-style component-file swapping; visual re-theming across a fixed component set is done with CSS-layer overrides targeting the `data-slot` attributes every shadcn v4 primitive now carries, not by re-issuing components.

### Tailwind v4 requirements

From [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4): Tailwind v4 components use the `@theme`/`@theme inline` directives instead of a JS config; color CSS variables are wrapped in `hsl()`/`oklch()` **outside** `@theme` (in `:root`/`.dark`), then re-exposed as unwrapped `--color-*` tokens **inside** `@theme inline` (e.g. `--color-background: var(--background)`), which is what makes the tokens usable directly in JS (`var(--chart-1)` instead of `hsl(var(--chart-1))`). shadcn's 2026 default palette is OKLCH, not HSL (the v4 migration note: "HSL colors are now converted to OKLCH"). In `registry-item.json`, `cssVars.theme` corresponds to `@theme` (non-color-scheme-dependent tokens like `--font-heading`), while `cssVars.light`/`cssVars.dark` correspond to the two `:root`/`.dark` variable sets. `forwardRef` is gone from all v4 components in favor of `React.ComponentProps<...>` + a `data-slot="..."` attribute on every primitive (this is also the hook that theming-by-CSS-override depends on, and something we should replicate on every migrated Medplum component for consistency and for future third-party theming). `size-*` utility replaces `w-* h-*` pairs. On Vite projects, Tailwind v4 is a `@tailwindcss/vite` Vite plugin — no `tailwind.config.js`/PostCSS required (PostCSS/`@tailwindcss/postcss` is only needed for non-Vite bundlers).

### Radix (`radix-ui`) vs Base UI

Timeline (from [July 2026 changelog](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default) and [shadcndeck.com](https://www.shadcndeck.com/blog/radix-vs-base-ui)): Radix was the only option 2023–early 2026; full Base UI docs landed January 2026; **July 2026: Base UI became the default** for `npx shadcn init`/`shadcn create` (new projects pick it 2:1 over Radix per shadcn's own telemetry). Radix is explicitly **not deprecated** — "every update and new component will ship for both libraries (unless a component only exists in Base UI)" — and shadcn recommends a component-by-component progressive migration if switching, never a big-bang rewrite, with both libraries coexisting during migration (a `migrate-radix-to-base` skill exists for exactly this: it fetches the Base UI variant of an item by URL, `.../styles/base-{style}/{item}.json`, writes it alongside the original as `-base.tsx`, migrates consumers one at a time, and only flips `components.json#style` once the last component is done). Package-wise: Radix now ships as one unified `radix-ui` npm package (v1.6.x, 30+ primitives) instead of per-component `@radix-ui/react-*` packages; Base UI ships as `@base-ui/react` (v1.6.0+, 35 components, MUI-backed, stable since Dec 2025, render-prop API instead of Radix's `asChild`/`Slot` pattern, built-in RTL, uses Floating UI for positioning).

**What a registry author must do to support both:** the CLI does **not** auto-transform one library's markup into the other for third-party registry items — that transformation logic (`transform-style-map.ts`, the `-base.tsx` migration skill) is internal tooling shadcn built for *its own* registry's preset system. For a custom registry like ours, supporting both means authoring and hosting two real variants of each file and routing between them, most naturally via the documented `{style}` URL placeholder (`@medplum/human-name-input` → `https://r.medplum.dev/{style}/human-name-input.json`) or via two separate namespaces (`@medplum-radix`, `@medplum-base`). **Recommendation: pick one library only for v1.** Given Medplum's ~128 components include comparatively few that touch Radix/Base UI primitives at all (mostly `Dialog`/`Popover`/`Select`/`Tabs`/`Tooltip`-style wrappers — most of the 128 are plain FHIR display/input components with no headless-primitive dependency), doubling every primitive is not worth it for v1. Given Base UI is now the shadcn default and actively developed (monthly releases) while Radix has slowed, **Base UI is the more future-proof default choice for new work in 2026**, but Radix remains fully acceptable and is what most existing shadcn ecosystem registries and examples still assume; either is a defensible, supported choice — this is a project decision, not a technical blocker.

### Testing a registry locally

Documented flow ([Getting Started](https://ui.shadcn.com/docs/registry/getting-started)): run `pnpm dev` (or whatever serves the built `public/r/*.json`) so items are live at `http://localhost:3000/r/[name].json`, then from a *separate* consumer project: `shadcn list http://localhost:3000/r/registry.json` (discover catalog), `shadcn search http://localhost:3000/r/registry.json --query button`, `shadcn view http://localhost:3000/r/button.json` (inspect payload/deps/files before installing), and `shadcn add http://localhost:3000/r/button.json` (actually install). The same four commands work against a namespace once registered (`shadcn registry add @acme=http://localhost:3000/r/{name}.json` then `shadcn add @acme/button`). `shadcn add` also accepts a bare local file path (`shadcn add ./local-registry/button.json`) with no server needed at all — the fastest inner loop for iterating on one component. The CLI's `add` command supports `--dry-run` ("preview changes without writing files") and `-o/--overwrite`, `-p/--path <path>` (custom install path), `-a/--all`, and `-c/--cwd <cwd>` (critical for monorepo workspaces).

### Hooks, utils, npm-package dependencies

Explicit guidance from Getting Started: "Make sure to list all registry dependencies in `registryDependencies`... Make sure to list all dependencies in `dependencies`... a dependency is the name of the package... eg. `zod`, `sonner`" (with `name@version` pinning support). `registry:hook` and `registry:lib` are first-class types precisely for non-visual logic — Medplum's FHIR formatting/validation helpers and the `useResource`/`useMedplum`-style hooks map directly onto these two types rather than `registry:ui`. There's no special ceremony for npm packages beyond listing them: `@medplum/core`, `@medplum/react-hooks`, `signature_pad`, and `jsqr` would all just be `dependencies` entries (with `@medplum/react-hooks` also plausibly a `registryDependencies` target for our own hook-only items if we want it re-exported as source rather than an npm dependency — but since it's an already-published, Mantine-free npm package, treating it as a normal `dependencies` entry is simpler and keeps FHIR-protocol logic out of scope for the "own the source" pitch).

### MCP server

Yes — `shadcn mcp` (see [MCP Server docs](https://ui.shadcn.com/docs/mcp), also documented for registry authors at [ui.shadcn.de/docs/registry/mcp](https://ui.shadcn.de/docs/registry/mcp), a community mirror of the same content). `npx shadcn mcp init --client <claude|cursor|vscode|codex|opencode>` scaffolds the client config (`.mcp.json`, `~/.codex/config.toml`, etc.); running `shadcn mcp` bare starts a stdio MCP server (built on `@modelcontextprotocol/sdk`) exposing tools like `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist` (tool names/line refs per [DeepWiki's analysis](https://deepwiki.com/shadcn-ui/ui/3.8-mcp-server-integration)). **No special work is required on our end to be MCP-visible**: "the shadcn MCP server works out of the box with any shadcn-compatible registry... you do not need to do anything special." It just needs a `registry.json` (or `registry`) file at the registry root and for the registry to be listed under the consumer's `components.json#registries`. Best practices given for MCP-friendly registries: clear, LLM-legible `title`/`description` per item, accurate `dependencies`, explicit `registryDependencies` for cross-item relationships, and consistent kebab-case naming — all things our ~128-item registry.json should do anyway. There is no `shadcn registry:mcp` deprecated subcommand that we found; the only past terminology drift is that `mcp` used to be reached at `shadcn registry:mcp` in some pre-2026 preview builds per community discussion threads, but current docs only reference `shadcn mcp` / `shadcn mcp init`.

---

## 2. Medplum's Storybook (behavioral reference)

Source: [https://storybook.medplum.com/index.json](https://storybook.medplum.com/index.json) (fetched successfully; Storybook v10 index format, `"v":5`).

- **Storybook version**: `10.5.10` (confirmed independently from `packages/storybook/package.json` and `packages/react/package.json` at [github.com/medplum/medplum](https://github.com/medplum/medplum) — `"storybook": "10.5.10"`, `"@storybook/react-vite": "10.5.10"`).
- **Total index entries**: 366 (363 `story` entries + 3 `docs`/MDX entries: `Medplum/Introduction` docs page and 2 non-story manifest entries).
- **Unique components with stories**: **118** (grouped by `title`, e.g. `Medplum/HumanNameDisplay`).
- Each story id follows `medplum-<componentname-lowercase>--<story-kebab-id>` and carries `componentPath` pointing at the real source file (e.g. `../react/src/AddressDisplay/AddressDisplay.tsx`), which is a convenient machine-readable map from story → source file for building a migration checklist.

Full component → story-name list (118 components, 363 stories total):

```
AddressDisplay: Basic
AddressInput: Basic, Default Value, Disabled, Partially Disabled
AnnotationInput: Basic, Disabled
AppShell: Basic, Long Menu, Disabled Search, Disabled Resource Navigator, Notification Icons, Dismissible Announcement, Persistent Announcement
AppointmentActorSelect: Provider, Room At A Clinic, Nothing Configured
AppointmentBookingForm: Basic, Untyped Medical Record Numbers, Surgical Team, No Availability, Site Asymmetry By Role
AppointmentDayTimes: One Provider, Several Providers, No Times
AppointmentServiceSelect: Basic, Narrowed To A Site
AppointmentSlotGroupCard: One Provider, A Team, Busy
AsyncAutocomplete: Multi Select Async Autocomplete, Slow Async Autocomplete
AttachmentArrayDisplay: Basic
AttachmentArrayInput: Basic, Default Value, Disabled
AttachmentButton: Example, Custom Text, Custom Component
AttachmentDisplay: Basic
AttachmentInput: Basic, Default Value, Disabled
Auth/ChangePasswordForm: Basic
Auth/ChooseProfileForm: Few Memberships, Many Memberships, Multiple Memberships In Project
Auth/ChooseScopeForm: Basic, With Open Id Scope, With Condition Scope, With Observation Scope, With Multiple Scopes, Custom Branding
Auth/MfaForm: Basic, With Qr Code
Auth/NewProjectForm: Basic, With Error
Auth/RegisterForm: Basic, With Footer, With Google
Auth/ResetPasswordForm: Basic, With Recaptcha, No Navigation
Auth/SetPasswordForm: Basic, No Sign In Callback
Auth/SignInForm: Basic, With Links, With Footer, With Google, Google Only
BackboneElementDisplay: Basic, Ignore Missing Values
BackboneElementInput: Basic
Calendar: Basic, With Availability Overlay
CalendarDateInput: Basic, Selected Day, Sparse Availability, Range, Selected Day Within A Stretch, Empty Days Still Pickable, Earliest Day, Caller Owned Month
CalendarInput: Basic
Chat/BaseChat: Basic, Delivered Timestamps, Chat Scrolls, Input Disabled, Without Header
Chat/ChatModal: Chat Closed, Chat Open
Chat/ThreadChat: Basic, Override Title, Input Disabled, With Attachment Upload
Chat/ThreadInbox: Basic
CodeInput: Basic, Default Value
CodeableConceptDisplay: Empty, Text Value, Code Value, Multiple Values
CodeableConceptInput: Basic, Default Value, Disabled
CodingDisplay: Basic
CodingInput: Basic, With Wrapper Text, With Error, Multiple Values, Disabled
Colors: Palette
ContactDetailDisplay: Basic
ContactDetailInput: Basic, Disabled, Partially Disabled
ContactPointDisplay: Basic
ContactPointInput: Basic, Disabled, Partially Disabled
DateTimeInput: Basic, Disabled
DefaultResourceTimeline: Basic
DescriptionList: Basic
DiagnosticReportDisplay: Simple, With Categories, Multiple Specimens, Hide Specimen Info, Hide Notes, Kitchen Sink, Lab Panel With Corrections, Observation Groups, Observation Group Hierarchy, Hide Subject
Document: Basic
EncounterTimeline: Encounter
ErrorBoundary: Basic
ExtensionInput: Basic
FhirPathDisplay: Id, Array Element, Composite Element
Form: Basic
FormSection: Basic, Readonly
GoogleButton: Basic
HumanNameDisplay: Basic
HumanNameInput: Basic, Disabled, Partially Disabled
IdentifierDisplay: Basic
IdentifierInput: Basic, Disabled, Partially Disabled
ListWithDetailPane: Basic, Loading, Empty
Logo: Basic
MeasureReportDisplay: Basic, Multiple, With Population
MedplumLink: Basic
Modal: Basic, With Form, Button Row, Long Content, Fixed Body Height, No Actions, Flush Body
MoneyDisplay: Basic
MoneyInput: Basic, Default Value, Disabled, Partially Disabled
MultiCalendar: Basic, With Hours Of Availability
MultiResourceInput: Empty, With Default Resources, With Default References, Many Defaults, Disabled, With Max Values, With Label, With Error, Practitioners
NotesDisplay: Simple, With Author, Multiple Notes
OperationOutcomeAlert: Basic, Issues
Panel: Basic, Extra Shadow, No Border, Rounded, Nested
PatientExportForm: Example
PatientSummary: Patient
PatientTimeline: Patient
PeriodInput: Example, Default Value, Disabled, Partially Disabled
PlanDefinitionBuilder: Basic, Covid 19 Eval, Covid 19 PCR Lab Service Story
QuantityDisplay: Basic
QuantityInput: Example, Default Value, Scroll Wheel Disabled, Disabled, Partially Disabled
QuestionnaireBuilder: Basic, Groups, Multiple Choice, Auto Save
QuestionnaireForm: Basic, Groups, Nested Groups, Pages, Lab Ordering, Page Sequence, Disable Pagination, Page And Non Page Sequence, Choices, Option Exclusive, Enable When, Enable When On Submit, Enable When With Questionnaire Response, Exclude Buttons With On Change, Repeatable Items, Kitchen Sink, Kitchen Sink With Initial Values, Kitchen Sink With Questionnaire Response, US Surgeon General Family Health Portrait, AHCHRSN Screening, Signature Required
QuestionnaireResponseDisplay: Basic, Multiple Answer Types, Nested Items, With Coding Answers, No Answers, Mixed Answered And Unanswered, Kitchen Sink, With Pages
RangeDisplay: Basic, High Only, Low Only
RangeInput: Basic, Disabled, Partially Disabled
RatioDisplay: Basic
RatioInput: Basic, Disabled, Partially Disabled
ReferenceDisplay: Basic
ReferenceInput: Target Profile, Free Text, Patient Profile And Patient, Disabled Target Profile, Disabled Free Text
ReferenceRangeEditor: Empty, HDL, Testosterone, ACR
RequestGroupDisplay: Simple, Covid 19
ResourceAvatar: Image, Letter, Sizes, Letter Sizes, Resource, With Text
ResourceBadge: Basic
ResourceBlame: Basic
ResourceBoard: Basic, With Tabs And Actions, Custom Load Items
ResourceDiff: Basic
ResourceDiffTable: Basic
ResourceForm: Patient, Partially Readonly Patient, Partially Hidden Patient, Organization, Practitioner, Service Request, Diagnostic Report, Diagnostic Report Issues, Observation, Questionnaire, Specimen, US Core Patient, US Core Patient Extension Readonly, US Core Patient Issues, US Core Implantable Device
ResourceHistoryTable: Basic
ResourceInput: Practitioners, Patients, Disabled, Error, Label
ResourceName: Resource, Reference, Invalid
ResourcePropertyDisplay: Name, Address, Attachment Property
ResourcePropertyInput: Address Input, Boolean Input, Date Input, Date Time Input, Extension Input
ResourceTable: Patient, Observation, Observation Ignore Empty, Covid 19 PCR Test Activity, Covid 19 Review Report Activity, Covid 19 Specimen Requirement, Covid 19 Observation Definition, US Core Patient
ResourceTimeline: Basic, With Comments
ScheduleAvailabilityEditor: Custom Hours Override, Inheriting Service Default, Overnight Hours, Off Interval Hours, No Hours Anywhere, With Cancel, Service Default, Service Default With No Hours
Scheduler: Basic, Multiple Schedules, Custom Slot Search
SchedulingWorkspace: Basic
SchedulingWorkspace/CalendarsPanel: Basic, Candidates Loading, No Candidates
SearchControl: Checkboxes, No Checkboxes, All Buttons, Extra Fields, Service Requests, Observations, Hide Toolbar, Hide Filters, Hide Toolbar And Filters, No Results
SearchExportDialog: Basic
SearchFieldEditor: Basic
ServiceRequestTimeline: Basic
SignatureInput: Basic
SmartAppLaunchLink: Basic
StatusBadge: Example Statuses
Timeline: Basic
TimingInput: Example, Default Value, Disabled, Partially Disabled
UnavailableNote: Suggestions Unavailable, Field Unavailable, Both Variants
ValueSetAutocomplete: Single, Multiple, Minimum Input, Unavailable
```

Note the task's premise of "~128 components" and this count of 118 storied components are consistent — the gap is components without stories (e.g. small internal helpers) or components counted differently by package export vs Storybook grouping. Either way, this list + `componentPath` mapping in `index.json` is a solid, complete behavioral-parity checklist: for each of the 118 titles, the migrated shadcn component should reproduce every named story state.

---

## 3. Prior art

### Medplum itself

- **No prior or active shadcn/Tailwind effort found.** `gh search issues|prs "shadcn"` and `"tailwind"` against `medplum/medplum` return zero shadcn hits; the only "tailwind" hits are unrelated (`Mantine experiment` PR title match on the word "react" label, an old PR title, and an unrelated CSS PR).
- **Medplum evaluated Tailwind and rejected it — twice, both in 2022.** [PR #1005 "Mantine experiment"](https://github.com/medplum/medplum/pull/1005) (author @codyebberson, the Medplum founder) states: *"Before, `@medplum/react` used vanilla React without any UI library... We evaluated multiple toolkits: Material UI, Ant Design, Chakra, Tailwind, and a bunch more. In the end, Mantine struck the right balance of visually pleasing, relatively lightweight, and flexibility."* This is the PR that introduced Mantine as the underlying toolkit and is the direct ancestor of today's `@medplum/react`.
- **A headless/Radix-flavored experiment was tried and abandoned** before that: [PR #929, "Simple Headless Editable Field, with different stories"](https://github.com/medplum/medplum/pull/929) (2022, **closed**, not merged): *"Experimental branch, trying to incorporate the concepts from headless UI libraries like ReachUI, RadixUI, and HeadlessUI into our medplum components."* This is essentially the same architectural direction we're proposing (headless logic + swappable presentation), attempted and dropped in favor of the Mantine path four years ago — worth knowing as prior institutional context, though the ecosystem (shadcn didn't exist yet in 2022) has changed enormously since.
- **`@medplum/react-hooks` has been Mantine-free since 2023** ([PR #3147, "Remove all references to Mantine from react-hooks", merged Oct 2023](https://github.com/medplum/medplum/pull/3147)) and remains so today: fetching `packages/react-hooks/package.json` from `main` shows **zero** `@mantine/*` dependencies of any kind (only `@medplum/*`, `react`, and test tooling). This is a real asset for our plan: all of Medplum's FHIR data-fetching/state hooks (`useResource`, `useMedplum`, `useSearchResources`, etc.) are already presentation-library-agnostic and could be depended on directly (as an npm `dependencies` entry) or re-exported by our registry's `registry:hook` items without pulling in any Mantine code.
- By contrast, `@medplum/react` itself (`packages/react/package.json`) still has `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight` as **peer** dependencies (marked `optional: true` in `peerDependenciesMeta`, interestingly — but `@mantine/core`/`hooks` are load-bearing for virtually every component, so "optional" likely just avoids install-time peer-dep errors rather than reflecting true optionality) at Mantine **v8.3.18**, alongside `jsqr` (QR scanning) and `signature_pad` (signature capture) as truly optional peers — both relevant to the "items that depend on npm packages" question in §1, and both good candidates for a shared `dependencies` array on the `SignatureInput`/QR-related registry items respectively.

### bonFHIR — the closest architectural precedent

[bonFHIR](https://bonfhir.dev/packages/react) already ships almost exactly the separation-of-concerns pattern this project is proposing, for the same domain (FHIR + React):

- `@bonfhir/react` provides **render-less** components — logic/state/FHIR-plumbing only, no visual output by themselves.
- A separate renderer package (bonFHIR currently ships `@bonfhir/mantine`, plus "preliminary support" for Gluestack UI on React Native) supplies the actual visual implementation.
- Wiring is a single `<FhirUIProvider renderer={MantineRenderer}>` at the app root ([Get Started](https://bonfhir.dev/packages/react/get-started)).
- Each render-less component (e.g. `FhirValue`) exposes a `rendererProps` escape hatch passed straight through to the underlying renderer's component, so renderer-specific customization doesn't leak into the render-less component's own prop surface.
- **Custom renderers are fully supported and documented** ([Custom renderers](https://bonfhir.dev/packages/react/custom-renderers)): you implement a component matching the `*RendererProps` contract (a strict superset of the public `*Props` that also exposes computed/derived values like `formattedValue`), then compose a renderer object — either wholesale (`satisfies FhirUIRenderer`) or by spreading an existing renderer and overriding just one entry (`{ ...MantineRenderer, FhirValue: CustomFhirValue }`). This is the same "override by target-path last-write-wins" idea shadcn's own `registryDependencies` resolution uses, just implemented at the React-component-prop level instead of the file-system level.
- Global TypeScript ergonomics are handled via `declare module "@bonfhir/react/r4b"` augmentation so app code doesn't need renderer-specific generic type params sprinkled everywhere.

**Relevance to our design**: bonFHIR proves the render-less-core / pluggable-renderer split is viable for a FHIR component library, but it is a **runtime abstraction** (a React context/provider swapping components), which is architecturally the opposite of shadcn's philosophy (compile-time code ownership, no runtime indirection, no provider). We should *not* copy bonFHIR's provider-injection mechanism, but we should absolutely copy its discipline of separating "what data/state does this component need" (→ our `registry:hook`/`registry:lib` items, ideally built directly on the already-Mantine-free `@medplum/react-hooks`) from "how is it drawn" (→ our `registry:ui`/`registry:component` items, owned as editable source by the consumer per shadcn's model). No evidence was found of a bonFHIR-to-shadcn adapter or a shadcn-flavored FHIR component registry existing anywhere in the community as of this research (targeted web searches for "medplum shadcn" and "medplum tailwind components" surfaced no community registry, blog post, or fork attempting this).

---

## 4. Storybook + shadcn + Tailwind v4 testing patterns (brief)

Current (2026) recommended stack: **Storybook 10** with the Vite builder (`@storybook/react-vite`), Tailwind v4 wired in as a Vite plugin — add `tailwindcss` + `@tailwindcss/vite` to `vite.config.ts`'s `plugins` (or via `viteFinal` in `.storybook/main.ts` if not sharing a root Vite config), `@import "tailwindcss";` in a CSS file loaded by `.storybook/preview.ts`, and no `tailwind.config.js`/PostCSS needed on the Vite path (PostCSS + `@tailwindcss/postcss` is only required for non-Vite builders) — see the official [Tailwind Vite install docs](https://tailwindcss.com/docs) and worked Storybook-specific walkthroughs ([medium.com/@ayomitunde.isijola](https://medium.com/@ayomitunde.isijola/integrating-storybook-with-tailwind-css-v4-1-f520ae018c10), [Stack Overflow](https://stackoverflow.com/questions/79503520/storybook-installation-guide-is-only-available-for-tailwindcss-v3-how-can-i-ins)); if component source lives outside the Storybook app's own `src/` (our case — a shared registry package), add a Tailwind v4 `@source '../path/to/registry'` directive so its class names get scanned, since v4 dropped the old `content` globs. For running stories as tests, install `@storybook/addon-vitest` (`npx storybook add @storybook/addon-vitest`), which wires a dedicated Vitest **project** (commonly named `storybook`) using the `storybookTest()` Vitest plugin plus Vitest **browser mode** on the Playwright provider (`browser: { enabled: true, provider: playwright(), instances: [{ browser: "chromium" }] }`) so every story (and any `play` function) runs against a real Chromium instead of jsdom, giving accurate layout/CSS/focus behavior; this project runs alongside — not instead of — regular unit-test projects in the same `vitest.config.ts`, and is what CI should invoke (`vitest --project=storybook` or `vitest run` for the full suite) — see [Storybook's official testing docs](https://storybook.js.org/docs/writing-tests.md) and worked examples ([dev.to/hirodeath](https://dev.to/hirodeath/turning-storybook-stories-into-vitest-browser-tests-in-nextjs-8i2)).

---

## Key decisions this research forces

1. **Pick one headless-primitives library for v1 — Base UI or Radix, not both.** The CLI does not auto-translate between them for third-party registries; supporting both means maintaining and hosting two real variants of every Dialog/Popover/Select/Tabs/Tooltip-style component (routed via the `{style}` URL placeholder or separate namespaces). Base UI is now shadcn's default and more actively developed in 2026; Radix is still fully supported and what most existing ecosystem examples assume. Recommend Base UI for new work, but this is a call to make explicitly, not default into.
2. **Structure the registry with `include`, not one giant `registry.json`.** With ~128 components, use nested `registry.json` files per domain (`display/`, `input/`, `forms/`, `scheduling/`, `chat/`, `auth/`) composed via the root's `include[]`, matching the natural grouping already visible in the Storybook titles (`Auth/*`, `Chat/*`, `SchedulingWorkspace/*`).
3. **Separate `registry:hook`/`registry:lib` (logic) from `registry:ui`/`registry:component` (presentation) per item**, mirroring bonFHIR's render-less/renderer split conceptually — but implement it as shadcn intends (plain composition/props, ideally building on the already Mantine-free `@medplum/react-hooks`), not as a runtime provider-injection layer.
4. **Decide npm-dependency policy for `@medplum/core`/`@medplum/react-hooks`/`signature_pad`/`jsqr`**: treat them as ordinary `dependencies` entries on the items that need them (simplest, keeps FHIR wire-protocol logic out of "owned" source) rather than re-vendoring their logic as registry source.
5. **Adopt `data-slot` attributes and `React.ComponentProps<...>` (no `forwardRef`) on every migrated component**, per the Tailwind v4 / shadcn v4 convention — this is also the mechanism that lets consumers re-theme components via CSS layers without forking source, which is presumably a goal given the "own the source" pitch.
6. **Ship a `registry:base` preset** pinning our `aliases`, baseColor/OKLCH theme, and pre-registered `registries` (if we split into multiple namespaces), but do not use it to fork component variants per visual archetype — use CSS-layer overrides on `data-slot` instead, per shadcn's own stated guidance.
7. **Decide monorepo distribution shape**: does the registry install into a shared `packages/ui`-style workspace package (each item's `files[].target` using `@ui/`/`@lib/`/`@hooks/` placeholders) so consuming apps get one shared copy, or does each consumer app pull its own copy? This determines whether we need per-workspace `components.json` and how `exports` in the shared package must be authored.
8. **Use the Storybook `index.json` (118 components / 363 stories) as the literal migration/parity checklist**, tracking each story as an acceptance criterion for its migrated shadcn component, and reuse Storybook 10 + `@storybook/addon-vitest` + Vitest browser mode (Playwright/Chromium) as the regression harness so migrated stories double as automated visual/interaction tests.
9. **Treat the closed 2022 headless-field experiment (medplum/medplum#929) as informative, not blocking**: Medplum tried and abandoned a Radix/Reach/HeadlessUI-style approach before choosing Mantine, but that was pre-shadcn and pre-Tailwind-v4; there is no current internal Medplum effort or stated intent (as of this search) to move off Mantine, so this migration is being done by us, independently, not in coordination with upstream — component-level API/behavior parity via the Storybook checklist is our main defense against silent regressions since we can't rely on upstream test coverage transferring automatically.
10. **Decide public distribution channel**: a hosted namespace (`@medplum` or `@seen-fhir` in `components.json#registries`, requiring us to host and maintain a JSON endpoint) versus the zero-infra August-2026 GitHub-registry path (`owner/repo/item-name`, works anonymously for public repos or via `gh auth`/`GH_TOKEN` for private) — the latter is viable as a fast path if we want internal Seen-only distribution before/without standing up public hosting.
