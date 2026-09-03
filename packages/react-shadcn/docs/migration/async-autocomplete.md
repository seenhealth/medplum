# AsyncAutocomplete migration

`AsyncAutocompleteOption<T>` no longer extends Mantine's `ComboboxItem`. It declares the same portable fields directly:
`value`, `label`, optional `disabled`, optional `active`, and `resource`.

`AsyncAutocompleteProps<T>` no longer extends Mantine's `ComboboxProps`. Its explicit API keeps `name`, `label`,
`description`, `error`, `defaultValue`, `toOption`, `loadOptions`, `itemComponent`, `pillComponent`, `emptyComponent`,
`onChange`, `onCreate`, `creatable`, `clearable`, `required`, `className`, `placeholder`, `leftSection`, `maxValues`,
`optionsDropdownMaxHeight`, `minInputLength`, and `disabled`.

Mantine-only inherited presentation and portal props are removed. Styling is supplied through `className`; the dropdown
uses the package Popover portal.
