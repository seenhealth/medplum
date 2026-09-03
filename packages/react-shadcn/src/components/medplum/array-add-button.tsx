// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/buttons/ArrayAddButton.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { IconCirclePlus } from '@tabler/icons-react';
import type { JSX, MouseEventHandler } from 'react';

export interface ArrayAddButtonProps {
  readonly propertyDisplayName?: string;
  readonly onClick: MouseEventHandler;
  readonly testId?: string;
}

export function ArrayAddButton({ propertyDisplayName, onClick, testId }: ArrayAddButtonProps): JSX.Element {
  const text = propertyDisplayName ? `Add ${propertyDisplayName}` : 'Add';

  return propertyDisplayName ? (
    <Button title={text} size="sm" variant="ghost" className="text-green-600" data-testid={testId} onClick={onClick}>
      <IconCirclePlus className="size-5" />
      {text}
    </Button>
  ) : (
    <Button title={text} variant="ghost" size="icon" className="text-green-600" data-testid={testId} onClick={onClick}>
      <IconCirclePlus className="size-5" />
    </Button>
  );
}
