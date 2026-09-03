# password-input

Upstream wraps Mantine `PasswordInput` only to default the visibility toggle. shadcn has no password primitive, so this is `Input type="password"` plus a toggle in `InputGroup`.

| Upstream                                                                | Port                                                                                                                                 |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `PasswordInputProps` (Mantine)                                          | `ComponentProps<typeof InputGroupInput>` (same native input props as shadcn `Input`)                                                 |
| `visibilityToggleButtonProps`                                           | dropped; the toggle is always rendered                                                                                               |
| Toggle `aria-label="Toggle password visibility"`                        | unchanged                                                                                                                            |
| Toggle `tabIndex` default `0` in the wrapper (Mantine default is `-1`)  | `tabIndex={-1}` on the toggle `Button` (per WU-14)                                                                                   |
| Mantine `label` / `description` / `error` / `leftSection` / size tokens | not on `Input`; compose `FormSection` / `className` around the control                                                               |
| Visibility icons                                                        | `IconEye` / `IconEyeOff` (`@tabler/icons-react`) on `Button variant="ghost" size="icon"` inside `InputGroupAddon align="inline-end"` |
