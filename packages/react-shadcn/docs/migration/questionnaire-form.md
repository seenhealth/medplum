# QuestionnaireForm

`QuestionnaireForm` and `AIRealTimeQuestionnaireForm` keep their upstream public props and behavior. The multi-file
registry item has no `index.ts` barrel; import each export from its named file.

| Upstream                                                                 | Port                                                                 |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `Stepper` / `Stepper.Step`                                               | `Stepper` / `StepperStep` / `StepperContent`                         |
| `Radio.Group` / `Radio`                                                  | `RadioGroup` / `RadioGroupItem` + `Label`                            |
| Explicit-option `MultiSelect`                                            | `AsyncAutocomplete` with a static option loader                      |
| `Collapse`                                                               | `Collapsible` / `CollapsibleContent`                                 |
| `Checkbox`, `TextInput`, `Textarea`, `NativeSelect`                      | shadcn `Checkbox`, `Input`, `Textarea`, `NativeSelect`               |
| `QuestionnaireFormStepperProps.children?: React.ReactNode`               | `children?: ReactNode` (equivalent imported type)                    |
| Mantine layout, typography, and `AIRealTimeQuestionnaireForm.module.css` | Tailwind utilities                                                   |
| `showNotification`                                                       | `notify.show` from `@/lib/medplum/notify`                            |
| Mantine `useDebouncedCallback`                                           | `useDebouncedCallback` from `@/hooks/medplum/use-debounced-callback` |

The `pendingChangeRef` post-commit notification flow, signature-required submit gate, native `reportValidity()` page
gate, and AI `responseVersion` remount key are unchanged.
