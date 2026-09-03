// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Panel/Panel.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { cn } from '@/lib/utils';
import type { ComponentProps, JSX } from 'react';

export type PanelProps = ComponentProps<'div'>;

// Mantine's `width`/`fill`/`shadow`/`radius`/`withBorder` props are expressed with className
// (`max-w-[600px]`, `p-0`, `shadow-xl`, `rounded-xl`, `border-0`).
export function Panel({ className, ...props }: PanelProps): JSX.Element {
  return (
    <div
      data-slot="panel"
      className={cn(
        'mx-auto my-8 rounded-md border bg-card p-4 text-card-foreground shadow-sm max-md:p-2',
        '[&_img]:w-full [&_img]:max-w-full [&_video]:w-full [&_video]:max-w-full',
        className
      )}
      {...props}
    />
  );
}
