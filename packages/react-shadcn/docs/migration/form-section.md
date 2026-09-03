# form-section

Upstream: `packages/react/src/FormSection/FormSection.tsx` (Mantine `Input.Wrapper`). Port: composed on shadcn `Field`.

| Upstream                                                        | Port                                                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `title="…"`                                                     | `<FormSectionLabel>…</FormSectionLabel>` child                                           |
| `description="…"`                                               | `<FormSectionDescription>…</FormSectionDescription>` child                               |
| `withAsterisk`                                                  | `<FormSectionLabel required>`                                                            |
| `children`                                                      | children (unchanged position)                                                            |
| error text rendered by `Input.Wrapper`                          | `<FormSectionError />` child (reads the matched `OperationOutcome` issues from the root) |
| `testId="…"`                                                    | `data-testid="…"` on the root (any `div` prop is accepted)                               |
| `htmlFor`, `outcome`, `errorExpression`, `fhirPath`, `readonly` | unchanged (behavior props)                                                               |
| —                                                               | `orientation` (`'vertical'` default, `'horizontal'` for `CheckboxFormSection`)           |

Behavior kept: the label is associated through `htmlFor`; `readonly` dims the label and wraps the section in the "Read Only" tooltip; `ElementsContext.debugMode` appends ` - <fhirPath>` to the label; the error text is `getErrorsForInput(outcome, errorExpression ?? htmlFor)` and the root carries `data-invalid` when present.

Added exports: `FormSectionLabel`, `FormSectionLabelProps`, `FormSectionDescription`, `FormSectionContent`, `FormSectionError`.
