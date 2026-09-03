# sensitive-textarea

Upstream: Mantine `Textarea` + `ActionIcon` + `useClipboard` + `showNotification`.

| Upstream                                                                           | Port                                                                          |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `SensitiveTextareaProps extends TextareaProps, RefAttributes<HTMLTextAreaElement>` | `ComponentProps<typeof Textarea>`                                             |
| Mantine `styles` bag (`styles.input.WebkitTextSecurity`, `styles.root.flexGrow`)   | `style.WebkitTextSecurity` when masked; `flexGrow: 1` on the textarea `style` |
| `autosize` / `minRows={1}`                                                         | `className="field-sizing-content min-h-0"`                                    |
| `ActionIcon` copy button                                                           | `Button variant="ghost" size="icon"` with `title="Copy secret"`               |
| `useClipboard` from `@mantine/hooks`                                               | `@/hooks/medplum/use-clipboard`                                               |
| `showNotification({ color: 'green', message: 'Copied' })`                          | `notify.success('Copied')`                                                    |
| Mantine `Textarea` presentation props (`label`, `error`, `minRows`, …)             | native textarea props + `className`                                           |
