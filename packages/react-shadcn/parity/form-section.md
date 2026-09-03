# API parity: `form-section`

Upstream: `packages/react/src/FormSection` · Port: `src/components/medplum/form-section.tsx`

## Exports

| | names |
|---|---|
| kept (2) | `FormSectionProps`, `FormSection` |
| removed (0) | — |
| added (5) | `FormSectionLabelProps`, `FormSectionLabel`, `FormSectionDescription`, `FormSectionContent`, `FormSectionError` |

### `FormSectionProps`

- extends: `—` → `extends ComponentProps<'div'>`
- removed `title?: string`
- removed `description?: string`
- removed `withAsterisk?: boolean`
- removed `children?: ReactNode`
- removed `testId?: string`
- added `orientation?: 'vertical' | 'horizontal' | 'responsive'`

## Verdict

12 delta(s). Documented in `docs/migration/form-section.md`.

