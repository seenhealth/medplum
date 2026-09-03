# signature-input

Upstream: `packages/react/src/SignatureInput/SignatureInput.tsx` (`SignatureInputProps extends PaperProps`). Port: a Panel-like `div`; `SignatureInputProps = Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'>` plus the behavior props.

| Upstream                                                                                                      | Port                                                                                               |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `PaperProps` (`withBorder`, `p`, `w`, `h`, `pos`, `shadow`, `radius`, …)                                      | Tailwind utilities via `className` / `style`                                                       |
| `Paper withBorder p={0} w={width} h={height} pos="relative"`                                                  | `div` with `relative rounded-md border bg-card` and `style={{ width, height }}`                    |
| `Button size="xs" variant="subtle" color="gray" pos="absolute" top={0} right={0} leftSection={<IconTrash />}` | `Button variant="outline" size="sm" className="absolute top-0 right-0"` with `<IconTrash />` child |
| canvas `width` / `height` (CSS-pixel attributes)                                                              | unchanged; same attributes, same `signature_pad` wiring                                            |

Kept: `width`, `height`, `defaultValue`, `who`, `onChange`, canvas `aria-label`, clear-button `aria-label`, `signature_pad` attach/teardown (including the upstream `beginStroke`/`endStroke` listener mismatch).
