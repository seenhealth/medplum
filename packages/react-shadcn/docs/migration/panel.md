# panel

Upstream: `packages/react/src/Panel/Panel.tsx` (`PanelProps extends PaperProps`). Port: a Card-styled `div`; `PanelProps = ComponentProps<'div'>`.

| Upstream                               | Port                               |
| -------------------------------------- | ---------------------------------- |
| `width={600}`                          | `className="max-w-[600px]"`        |
| `fill`                                 | `className="p-0"`                  |
| `shadow="xl"`                          | `className="shadow-xl"`            |
| `radius="xl"`                          | `className="rounded-xl"`           |
| `withBorder={false}`                   | `className="border-0"`             |
| other `PaperProps` (`p`, `m`, `bg`, …) | Tailwind utilities via `className` |

Default look: `mx-auto my-8 rounded-md border bg-card p-4 shadow-sm`, `p-2` under `md`, images and videos stretched to the panel width (upstream `Panel.module.css`).

`Document` and `Container` accept the same `ComponentProps<'div'>`; `ContainerProps` no longer re-exports Mantine's type.
