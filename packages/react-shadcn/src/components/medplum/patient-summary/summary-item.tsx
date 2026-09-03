// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/SummaryItem.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { IconChevronRight } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';

interface SummaryItemProps {
  children: ReactNode;
  onClick: () => void;
}

export default function SummaryItem(props: SummaryItemProps): JSX.Element {
  const { children, onClick } = props;
  return (
    <div className="group relative max-w-full cursor-pointer" onClick={onClick}>
      {children}
      <div className="pointer-events-none absolute top-0 right-7 bottom-0 z-1 w-12 bg-gradient-to-r from-transparent to-white opacity-0 transition-opacity group-hover:opacity-100 dark:to-zinc-950" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-2 flex w-7 items-center justify-center bg-white opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-zinc-950">
        <Button className="m-0 flex items-center justify-center p-0" size="icon" variant="ghost" tabIndex={-1}>
          <IconChevronRight size={16} stroke={2.5} />
        </Button>
      </div>
    </div>
  );
}
