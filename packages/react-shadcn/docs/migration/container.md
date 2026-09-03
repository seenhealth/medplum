# container

Upstream: `packages/react/src/Container/Container.tsx` re-exported Mantine's `ContainerProps` (`size`, `fluid`, …). Port: `ContainerProps = ComponentProps<'div'>`.

| Upstream                      | Port                                                              |
| ----------------------------- | ----------------------------------------------------------------- |
| `size="md"` (default, 960px)  | default `max-w-[960px]`                                           |
| `size="sm"` / `"lg"` / `"xl"` | `className="max-w-[720px]"` / `max-w-[1140px]` / `max-w-[1320px]` |
| `fluid`                       | `className="max-w-none"`                                          |

Padding: `px-4`, `px-1` under `md` (upstream `Container.module.css`).
