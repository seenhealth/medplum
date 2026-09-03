# date-time-input

`DateTimeInputProps` is unchanged (`name`, `label`, `placeholder`, `defaultValue`, `autoFocus`, `outcome`, `onChange`, `required`, `disabled`, `data-testid`). ISO ↔ local conversion in `date-time-input-utils.ts` is unchanged.

| Upstream                               | Port                                                     |
| -------------------------------------- | -------------------------------------------------------- |
| Mantine `TextInput` (`label`, `error`) | `Field` + optional `FieldLabel` + `Input` + `FieldError` |
| `error={getErrorsForInput(…)}`         | `aria-invalid` on the input and `FieldError` children    |
