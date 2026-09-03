# status-badge

Upstream: `packages/react/src/StatusBadge/StatusBadge.tsx` (`StatusBadgeProps extends Omit<BadgeProps, 'children'>` plus a `DefaultMantineColor` map). Port: shadcn `Badge` plus a `cva` status map.

| Upstream                                         | Port                                                                                                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Omit<BadgeProps, 'children'>`                   | `Omit<ComponentProps<typeof Badge>, 'children'>`                                                                                                          |
| `color={props.color \|\| statusToColor[status]}` | `cva` classes on `Badge` (every upstream status→color assignment kept: blue/yellow/red/green/gray → matching Tailwind `bg-*-100 text-*-800` / `bg-muted`) |
| `color` override                                 | `className`                                                                                                                                               |

`status` and `status.replaceAll('-', ' ')` text are unchanged.
