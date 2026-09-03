// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/DescriptionList/DescriptionList.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { cn } from '@/lib/utils';
import type { JSX, ReactNode } from 'react';

export interface DescriptionListProps {
  readonly children: ReactNode;
  readonly compact?: boolean;
}

export function DescriptionList(props: DescriptionListProps): JSX.Element {
  const { children, compact } = props;
  return (
    <dl
      className={cn(
        'm-0 grid grid-cols-[30%_70%] [&_dd]:m-0 [&_dd]:border-t [&_dd]:border-border [&_dd]:p-2 [&_dd:first-of-type]:border-t-0 [&_dt]:m-0 [&_dt]:border-t [&_dt]:border-border [&_dt]:p-2 [&_dt:first-of-type]:border-t-0',
        compact &&
          'grid-cols-[auto_1fr] [&_dd]:border-0 [&_dd]:p-0 [&_dd]:pl-2 [&_dd:last-of-type]:pb-2 [&_dt]:border-0 [&_dt]:p-0 [&_dt]:pr-2 [&_dt:last-of-type]:pb-2'
      )}
    >
      {children}
    </dl>
  );
}

export interface DescriptionListEntryProps {
  readonly term: string;
  readonly children: ReactNode;
}

export function DescriptionListEntry(props: DescriptionListEntryProps): JSX.Element {
  return (
    <>
      <dt>{props.term}</dt>
      <dd>{props.children}</dd>
    </>
  );
}
