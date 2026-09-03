// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/buttons/ArrayRemoveButton.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { IconCircleMinus } from '@tabler/icons-react';
import type { JSX, MouseEventHandler } from 'react';

export interface ArrayRemoveButtonProps {
  readonly propertyDisplayName?: string;
  readonly onClick: MouseEventHandler;
  readonly testId?: string;
}

export function ArrayRemoveButton({ propertyDisplayName, onClick, testId }: ArrayRemoveButtonProps): JSX.Element {
  return (
    <Button
      title={propertyDisplayName ? `Remove ${propertyDisplayName}` : 'Remove'}
      variant="ghost"
      size="icon"
      className="text-red-500"
      data-testid={testId}
      onClick={onClick}
    >
      <IconCircleMinus className="size-5" />
    </Button>
  );
}
