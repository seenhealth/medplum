# form

Upstream: `packages/react/src/Form/` (`Form`, `Form.context`, `FormUtils`, `SubmitButton`). The `<form>` + `parseForm` + submitting flag is unchanged.

| Upstream                                                                             | Port                                                                                                                                                 |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FormProps` (`onSubmit`, `style`, `children`, `testid`)                              | unchanged                                                                                                                                            |
| `parseForm`                                                                          | unchanged                                                                                                                                            |
| `FormContext` (`{ submitting }`)                                                     | unchanged, plus `useFormContext()`                                                                                                                   |
| `SubmitButtonProps = Omit<ButtonProps, 'type' \| 'loading'>` (Mantine `ButtonProps`) | `Omit<ComponentProps<typeof Button>, 'type'>` (shadcn `Button`)                                                                                      |
| `<SubmitButton loading={…}>` / Mantine `loading`                                     | `loading` is not a public prop. `SubmitButton` reads `submitting` from `useFormContext()` / `FormContext` and sets `disabled` plus a `Spinner` child |
| `<SubmitButton mt="sm">`                                                             | `<SubmitButton className="mt-3">`                                                                                                                    |
| Mantine `Button` presentation props (`variant`, `size`, `color`, …)                  | shadcn `Button` props (`variant`, `size`, `className`, …)                                                                                            |

`Form` still calls `e.preventDefault()`, `parseForm(e.target)`, and treats a thenable `onSubmit` return as in-flight (`setSubmitting(true)` until `finally`).
