// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PasswordInput/PasswordInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import type { ComponentProps, JSX } from 'react';
import { useState } from 'react';

export type PasswordInputProps = ComponentProps<typeof InputGroupInput>;

/**
 * Mantine's `PasswordInput` sets `tabIndex={-1}` and `aria-hidden` on the visibility toggle button
 * unless `visibilityToggleButtonProps` is provided, which removes it from the keyboard tab order and
 * hides it from assistive technology. This wrapper defaults the toggle to be keyboard accessible.
 * @param props - The password input props.
 * @returns The password input component.
 */
export function PasswordInput(props: PasswordInputProps): JSX.Element {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup>
      <InputGroupInput {...props} type={visible ? 'text' : 'password'} />
      <InputGroupAddon align="inline-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle password visibility"
          tabIndex={-1}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}
