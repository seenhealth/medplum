# Modal

Upstream `Modal` (`packages/react/src/Modal/Modal.tsx`) is a thin shell around Mantine's `Modal`
that adds a scrolling body and a pinned footer for `actions`, and forwards every other Mantine
`ModalProps` field. This package's `Modal` is a full composition on `@/components/ui/dialog`
(Radix Dialog): presentational fields become sub-components (`ModalHeader`, `ModalTitle`,
`ModalDescription`, `ModalBody`, `ModalFooter`), behavior fields stay as props on `Modal` itself,
per decision D5.

## Prop mapping

| Upstream (`Modal`/Mantine `ModalProps`)                | This package                                            | Notes                                                                                                                                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opened`                                               | `open`                                                  | Radix idiom.                                                                                                                                                                                             |
| `onClose`                                              | `onOpenChange`                                          | Called with `false` on close; Radix idiom instead of a no-arg callback.                                                                                                                                  |
| `title`                                                | `<ModalHeader><ModalTitle>…</ModalTitle></ModalHeader>` | Header is only rendered when the caller composes it.                                                                                                                                                     |
| `children` (body content)                              | `<ModalBody>…</ModalBody>`                              | The single scrolling region: `flex-1 min-h-0 overflow-y-auto`.                                                                                                                                           |
| `actions`                                              | `<ModalFooter>…</ModalFooter>`                          | Pinned to the bottom, right-aligned, border-top; omit for content-only modals.                                                                                                                           |
| `size` (`xs`\|`sm`\|`md`\|`lg`\|`xl`\|`100%`\|px\|`%`) | `size?: 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`         | Fixed set of Tailwind max-width classes via `cva` (`sm` 24rem, `md` 32rem default, `lg` 40rem, `xl` 56rem, `full` 100vw/100vh). Arbitrary px/percent sizes have no equivalent; pass `className` instead. |
| `centered`                                             | `centered?: boolean` (default `true`)                   | `false` pins the dialog near the top instead of vertically centering it.                                                                                                                                 |
| `closeOnClickOutside`                                  | `closeOnClickOutside?: boolean` (default `true`)        | `false` calls `event.preventDefault()` in Radix's `onInteractOutside`.                                                                                                                                   |
| `withCloseButton`                                      | `withCloseButton?: boolean` (default `true`)            | Passed through to `DialogContent`'s `showCloseButton`.                                                                                                                                                   |
| `closeButtonProps={{ 'aria-label': 'Close' }}`         | n/a                                                     | `DialogContent`'s built-in close button already has the accessible name "Close" (visually-hidden text, not a literal `aria-label` attribute); there is no prop bag to override it in this API.           |
| `fullScreen`                                           | `size="full"`                                           |                                                                                                                                                                                                          |
| `zIndex`                                               | `className`                                             | No dedicated prop; stacking is a Tailwind class on the root `Dialog`/`DialogContent` when needed.                                                                                                        |
| `classNames` (Mantine per-slot class bag)              | n/a                                                     | Each sub-component (`ModalHeader`, `ModalBody`, `ModalFooter`, …) takes its own `className` directly.                                                                                                    |
| `styles` (Mantine per-slot style bag)                  | n/a                                                     | Use `className`/Tailwind on the relevant sub-component.                                                                                                                                                  |
| `bodyHeight`                                           | n/a                                                     | Dropped; pass a height utility class (e.g. `className="h-[60vh]"`) to `ModalBody` instead of a CSS custom property.                                                                                      |
| `onSubmit`                                             | n/a                                                     | `Form`/`SubmitButton` are not yet ported to `@medplum/react-shadcn`; callers wrap their own `<form>` inside the composition until they are.                                                              |
| `padding`, `radius`                                    | n/a                                                     | Baked into the Tailwind classes on `DialogContent`/sub-components.                                                                                                                                       |

## Layout

Upstream's flex chain (`Modal.module.css`: `.content` → `.header`/`.body` (flex column) →
`.scroll` (the single scrolling region) → `.footer` pinned at the bottom) is reproduced with
Tailwind on `DialogContent` (`flex flex-col max-h-[85vh] p-0 gap-0`), `ModalHeader`/`ModalFooter`
(`shrink-0` with padding and a border), and `ModalBody` (`flex-1 min-h-0 overflow-y-auto`).

## Upstream tests skipped

`Modal.test.tsx` has 14 cases; 6 were adapted to the composition API and pass, 8 are skipped as
Mantine-DOM-specific or tied to props dropped from this API (see the reason string on each
`test.skip` in `modal.test.tsx`):

- `Applies the layout classes alongside the Mantine classes` — asserts `.mantine-Modal-*` classes; no Mantine classes exist in this composition.
- `Merges caller classNames rather than replacing them` — Mantine's `classNames` prop bag has no equivalent; each sub-component takes its own `className`.
- `Leaves the styles prop as an escape hatch` — Mantine's per-slot `styles` bag has no equivalent.
- `Sets the body height custom property` — `bodyHeight` dropped from the API.
- `Omits the body height custom property by default` — `bodyHeight` dropped from the API.
- `Submits body fields from an action button` — depends on `Form`/`SubmitButton`, not yet ported to `@medplum/react-shadcn`; `onSubmit` removed from `Modal`.
- `Allows overriding the close button props` — `closeButtonProps` bag replaced by the boolean `withCloseButton`; no override mechanism.
- `Renders no header without a title or close button` — header visibility is now caller-controlled via composition; there is no `title` prop to tie it to.
