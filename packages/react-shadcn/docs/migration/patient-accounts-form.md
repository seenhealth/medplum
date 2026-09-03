# patient-accounts-form

| Upstream                                                               | Port                                                                                                      |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `<Modal opened onClose title size keepMounted>`                        | `<Modal open onOpenChange size>` composed with `ModalHeader` / `ModalTitle` / `ModalBody` / `ModalFooter` |
| `keepMounted`                                                          | n/a — Radix unmounts the closed dialog                                                                    |
| `ActionIcon variant="subtle" color="red"`                              | `Button variant="ghost" size="icon" className="text-destructive"`                                         |
| Mantine `Badge color variant="light"`                                  | shadcn `Badge` + Tailwind color classes                                                                   |
| `notifications.show` / `notifications.update`                          | `notify.show({ id, … })` / `notify.update(id, …)`                                                         |
| `icon`, `withCloseButton` on notifications                             | dropped (not on `notify`)                                                                                 |
| `<Checkbox label onChange={(event) => … event.currentTarget.checked}>` | `Checkbox` + `FieldLabel htmlFor` + `onCheckedChange`                                                     |
