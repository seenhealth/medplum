// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/LinkTabs/LinkTabs.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)

import { MedplumLink } from '@/components/medplum/medplum-link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isString, locationUtils } from '@medplum/core';
import { useMedplumNavigate } from '@medplum/react-hooks';
import type { ComponentProps, JSX, ReactNode } from 'react';
import { useState } from 'react';

export interface TabDefinition {
  readonly label: string;
  readonly value: string;
}

export interface LinkTabsProps extends Omit<ComponentProps<typeof Tabs>, 'value' | 'onValueChange'> {
  readonly baseUrl: string;
  readonly tabs: string[] | TabDefinition[];
  readonly children?: ReactNode;
}

export function LinkTabs(props: LinkTabsProps): JSX.Element {
  const { baseUrl, tabs: tabDefinitions, children, ...rest } = props;
  const tabs = normalizeTabDefinitions(tabDefinitions);
  const navigate = useMedplumNavigate();

  const [currentTab, setCurrentTab] = useState(() => {
    const segment = locationUtils.getPathname().split('/').pop();
    if (segment) {
      const segmentLower = segment.toLowerCase();
      const matched = tabs.find((t) => t.value.split(/[?#]/)[0].toLowerCase() === segmentLower);
      if (matched) {
        return matched.value;
      }
    }
    return tabs[0].value;
  });

  function onTabChange(newTabName: string | null): void {
    newTabName = newTabName || tabs[0].value;
    setCurrentTab(newTabName);
    navigate(`${baseUrl}/${newTabName}`);
  }

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} {...rest}>
      <TabsList className="flex-nowrap whitespace-nowrap">
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value} onClick={() => onTabChange(t.value)}>
            <MedplumLink
              to={`${baseUrl}/${t.value}`}
              className="text-foreground leading-none no-underline hover:no-underline"
            >
              {t.label}
            </MedplumLink>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

function normalizeTabDefinitions(tabs: string[] | TabDefinition[]): TabDefinition[] {
  return tabs.map((t) => (isString(t) ? { label: t, value: t.toLowerCase() } : t));
}
