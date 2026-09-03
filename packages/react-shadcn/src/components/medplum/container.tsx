// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Container/Container.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { cn } from '@/lib/utils';
import type { ComponentProps, JSX } from 'react';

export type ContainerProps = ComponentProps<'div'>;

export function Container({ className, ...props }: ContainerProps): JSX.Element {
  return (
    <div data-slot="container" className={cn('mx-auto w-full max-w-[960px] px-4 max-md:px-1', className)} {...props} />
  );
}
