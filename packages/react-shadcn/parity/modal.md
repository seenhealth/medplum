# API parity: `modal`

Upstream: `packages/react/src/Modal` · Port: `src/components/medplum/modal.tsx`

## Exports

| | names |
|---|---|
| kept (2) | `ModalProps`, `Modal` |
| removed (0) | — |
| added (5) | `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter` |

### `ModalProps`

- extends: `extends Omit<MantineModalProps, 'children' | 'onSubmit' | 'scrollAreaComponent'>` → `extends ComponentProps<typeof DialogContent>, VariantProps<typeof modalContentVariants>`
- removed `children: ReactNode`
- removed `actions?: ReactNode`
- removed `onSubmit?: (formData: Record<string, string>) => Promise<void> | void`
- removed `bodyHeight?: string`
- added `open: boolean`
- added `onOpenChange: (open: boolean) => void`
- added `centered?: boolean`
- added `closeOnClickOutside?: boolean`
- added `withCloseButton?: boolean`

## Verdict

15 delta(s). Documented in `docs/migration/modal.md`.

