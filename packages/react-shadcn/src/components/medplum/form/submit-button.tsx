// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Form/SubmitButton.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { useFormContext } from '@/components/medplum/form/form-context';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { ComponentProps, JSX } from 'react';

export type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type'>;

export function SubmitButton(props: SubmitButtonProps): JSX.Element {
  const { children, disabled, ...buttonProps } = props;
  const { submitting } = useFormContext();
  return (
    <Button type="submit" disabled={disabled || submitting} {...buttonProps}>
      {submitting && <Spinner />}
      {children}
    </Button>
  );
}
