# operation-outcome-alert

Upstream: `packages/react/src/OperationOutcomeAlert/OperationOutcomeAlert.tsx` (`OperationOutcomeAlertProps extends AlertProps`). Port: shadcn `Alert variant="destructive"` + `AlertTitle` + `AlertDescription`.

| Upstream                                                      | Port                                                                       |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Mantine `AlertProps` (`color`, `icon`, spacing shorthands, …) | `ComponentProps<typeof Alert>`                                             |
| `title` (Mantine Alert title slot)                            | `title` rendered as `<AlertTitle>` (still accepted so existing calls work) |
| `color="red"` / `icon={<IconAlertCircle>}`                    | fixed `variant="destructive"` and `IconAlertCircle`                        |
| `outcome`, `issues`, `displayOkOutcomes`                      | unchanged                                                                  |

Empty / OK outcomes still render nothing unless `displayOkOutcomes` is set. Each issue stays a `data-testid="text-field-error"` row.
