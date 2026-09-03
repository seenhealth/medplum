# PatientSummary

Upstream `PatientSummary` is a multi-file clinical panel. This package ports it as one registry
item (`patient-summary`) under `components/medplum/patient-summary/` with no `index.ts` barrel —
imports name the file (`@/components/medplum/patient-summary/patient-summary`,
`…/section-configs`, `…/pharmacy-dialog`, …).

## Prop / API mapping

| Upstream                                                                                       | This package                                                                                         | Notes                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PatientSummary`, `PatientSummaryProps`, `PatientSummarySectionConfig`, `SectionRenderContext` | unchanged                                                                                            | Section registry (`section-configs.tsx`) is Mantine-free and lifted as-is aside from layout classes.        |
| `useDisclosure`                                                                                | `useState` + `open`/`close` callbacks                                                                | Same open/close contract.                                                                                   |
| `<Modal opened onClose title size onSubmit actions>`                                           | `<Modal open onOpenChange>` + `ModalHeader`/`ModalTitle` + `Form` wrapping `ModalBody`/`ModalFooter` | See `docs/migration/modal.md`. `size="80%"` on Labs → `className="sm:max-w-[80%]"`.                         |
| `showNotification` (PharmacyDialog, 6 sites)                                                   | `notify.show` from `@/lib/medplum/notify`                                                            | Same `color`/`title`/`message`.                                                                             |
| `Collapse in`                                                                                  | `Collapsible open` + `CollapsibleContent`                                                            | Chevron/`data-collapsed` and add-button `aria-label`s kept.                                                 |
| `Radio.Group` / `Radio`                                                                        | `RadioGroup` / `RadioGroupItem` + `Label`                                                            | Hidden `name` input so `Form`/`parseForm` still reads the selected value. Labels kept for `getByLabelText`. |
| `Checkbox label`                                                                               | `Field orientation="horizontal"` + `Checkbox` + `FieldLabel`                                         | `getByLabelText('Set as primary pharmacy')` still works.                                                    |
| `TextInput` / `Textarea`                                                                       | `FormSection` + `Input` / `Textarea`                                                                 | `name`, `id`, `placeholder`, `defaultValue` preserved.                                                      |
| `ActionIcon`                                                                                   | `Button variant="ghost" size="icon"`                                                                 | Same `title`/`aria-label`.                                                                                  |
| `StatusBadge color variant="light"`                                                            | `StatusBadge status={…}`                                                                             | Color is now the shared `status` cva map, not per-section Mantine colors.                                   |
| `ResourceAvatar size={48} radius={48} style={{ border }}`                                      | `ResourceAvatar className="size-12 rounded-full border-2 border-white"`                              | Presentational Avatar props are composition/`className`.                                                    |
| `SummaryItem.module.css` (gradient + hover chevron)                                            | Tailwind `group-hover` utilities                                                                     | Visual equivalent.                                                                                          |
| CSS modules (`PatientSummary`, `CollapsibleSection`, `PharmacyDialog`)                         | Tailwind                                                                                             | Deleted.                                                                                                    |

Public exports match upstream `index.ts`: `PatientSummary`, types from `patient-summary-types.ts`,
`Pharmacies`, `pharmacy-utils`, `PharmacyDialog`, every `*Section` plus `createLabsSection` /
`createPharmaciesSection` / `getDefaultSections`, and `summaryResourceListSection`.

## Status colour assertions

Six upstream tests (`Allergy/Goal/Immunization/Medication/Problem status colors`, `Status Badge colors`) asserted Mantine palette values (`--badge-color: var(--mantine-color-*-light-color)`) on `.mantine-Badge-root`. Colours are a shadcn/cva decision here (`StatusBadge`), so those assertions now check that each status renders inside a `[data-slot="badge"]`.
