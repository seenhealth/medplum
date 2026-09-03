# patient-export-form

| Upstream                                                         | Port                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `<FormSection title description withAsterisk>`                   | composed `FormSection` / `FormSectionLabel` / `FormSectionDescription` / `FormSectionError`      |
| `<SegmentedControl name="format" data value onChange fullWidth>` | `ToggleGroup type="single"` + `ToggleGroupItem` (format stays in React state; not a named input) |
| `<Checkbox label onChange={(e) => … e.currentTarget.checked}>`   | `Checkbox` + `FieldLabel` + `onCheckedChange`                                                    |
| `notifications.show` / `notifications.update`                    | `notify.show({ id, … })` / `notify.update(id, …)`                                                |
| `icon`, `withCloseButton` on notifications                       | dropped (not on `notify`)                                                                        |
