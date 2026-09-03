# resource-name

Upstream: `packages/react/src/ResourceName/ResourceName.tsx` (`ResourceNameProps extends TextProps`). Port: a `<span>` or `MedplumLink`.

| Upstream                                       | Port                                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `TextProps` (`c`, `fw`, `size`, `truncate`, …) | `Omit<ComponentProps<'span'>, 'ref'>` — style with `className` (`ref` omitted so `link` can spread onto `MedplumLink`) |
| `value`, `link`                                | unchanged                                         |
| `<Text component="span">`                      | `<span>`                                          |

Behavior kept: `[${normalizeErrorString(outcome)}]` on error; `null` while unresolved; `link` switches to `MedplumLink`.
