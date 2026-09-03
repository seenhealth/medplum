// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/CollapsibleSection.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { killEvent } from '@/lib/medplum/dom';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';

export interface CollapsibleSectionProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly onAdd?: () => void;
}

export function CollapsibleSection(props: CollapsibleSectionProps): JSX.Element {
  const { title, children, onAdd } = props;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative py-2">
      <div className="flex w-full flex-nowrap items-center justify-between">
        <div className="flex flex-nowrap items-center gap-2">
          <Button
            variant="ghost"
            className={`cursor-pointer rounded-full text-gray-700 transition-transform duration-200 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800 ${collapsed ? '-rotate-90' : ''}`}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? `Show ${title.toLowerCase()}` : `Hide ${title.toLowerCase()}`}
            data-collapsed={collapsed || undefined}
            size="icon"
          >
            <IconChevronDown size={20} />
          </Button>
          <p className="cursor-pointer text-base font-extrabold" onClick={() => setCollapsed((c) => !c)}>
            {title}
          </p>
        </div>

        {onAdd && (
          <Button
            role="button"
            aria-label="Add item"
            className="shrink-0 rounded-full"
            variant="ghost"
            onClick={(e) => {
              killEvent(e);
              onAdd();
            }}
            size="icon"
          >
            <IconPlus size={18} />
          </Button>
        )}
      </div>

      <Collapsible open={!collapsed}>
        <CollapsibleContent>
          <div className="mt-2 mb-4 ml-8 pl-1">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
