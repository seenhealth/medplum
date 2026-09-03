// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/UnavailableNote/UnavailableNote.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { IconInfoCircle } from '@tabler/icons-react';
import type { JSX } from 'react';

export interface UnavailableNoteProps {
  readonly text: string;
  readonly color: string;
  readonly message: string;
}

export function UnavailableNote({ text, color, message }: UnavailableNoteProps): JSX.Element {
  let colorClass: string | undefined;
  if (color.startsWith('yellow')) {
    colorClass = 'text-yellow-700';
  } else if (color.startsWith('red')) {
    colorClass = 'text-red-600';
  }
  return (
    <span className={cn('text-xs', colorClass)}>
      {text}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('ml-1 size-4 align-text-bottom', colorClass)}
            aria-label={`Why is this unavailable? ${message}`}
          >
            <IconInfoCircle className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </span>
  );
}
