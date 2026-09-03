# ReferenceInput migration

`ReferenceInputProps` is unchanged. Target types remain the `BaseTargetType` / `ProfileTargetType` union; `searchCriteria` is still forwarded (and `_profile` is still appended for profile targets).

| Upstream                                                         | Port                                                                                                                         |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Mantine `Group gap="xs" grow wrap="nowrap"`                      | `<div className="flex flex-nowrap gap-2">` with the type control `w-auto` and the resource search `flex-1`                   |
| Mantine `NativeSelect` `data={typeSelectOptions}`                | `NativeSelect` + `NativeSelectOption` children; `data-testid`, `name`, option `value`/`label` unchanged                      |
| `ResourceTypeInput` (no `targetTypes`, or `[]` / `['Resource']`) | same `ResourceTypeInput` composition (`name`, `placeholder="Resource Type"`, `testId="reference-input-resource-type-input"`) |
