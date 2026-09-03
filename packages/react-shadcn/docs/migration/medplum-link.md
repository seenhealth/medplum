# medplum-link

Upstream: `packages/react/src/MedplumLink/MedplumLink.tsx` (`MedplumLinkProps extends AnchorProps, ElementProps<'a', keyof AnchorProps>`). Port: a native `<a>`.

| Upstream                                                                                    | Port                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `AnchorProps` / `ElementProps<'a'>` (`c`, `fw`, `size`, `underline`, spacing shorthands, …) | `ComponentProps<'a'>` — style with `className`    |
| `to`, `suffix`, `label`, `onClick`                                                          | unchanged                                         |
| default Mantine Anchor look                                                                 | `text-primary underline-offset-4 hover:underline` |

Behavior kept: `onAuxClick` only `stopPropagation()`s; `onClick` `stopPropagation()`s, then either the custom `onClick` (and `preventDefault`) or `navigate(href)` unless `isAuxClick`.
