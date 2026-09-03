# checkbox-form-section

Upstream: `packages/react/src/CheckboxFormSection/CheckboxFormSection.tsx`. Port: `FormSection` with `orientation="horizontal"`.

| Upstream                                                                                              | Port                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<CheckboxFormSection title description withAsterisk htmlFor testId>{checkbox}</CheckboxFormSection>` | `<CheckboxFormSection htmlFor data-testid>{checkbox}<FormSectionContent><FormSectionLabel required>title</FormSectionLabel><FormSectionDescription>description</FormSectionDescription></FormSectionContent></CheckboxFormSection>` |
| `readonly`, `fhirPath`                                                                                | unchanged                                                                                                                                                                                                                           |

`CheckboxFormSectionProps` is `Omit<FormSectionProps, 'orientation'>`; see `form-section.md` for the field-level mapping.
