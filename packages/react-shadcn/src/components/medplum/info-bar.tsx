// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/InfoBar/InfoBar.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ScrollArea } from '@/components/ui/scroll-area';
import type { JSX, ReactNode } from 'react';

export interface InfoBarProps {
  readonly children: ReactNode;
}

export function InfoBar(props: InfoBarProps): JSX.Element {
  return (
    <ScrollArea>
      <div className="flex flex-row items-center px-2.5 py-2">{props.children}</div>
    </ScrollArea>
  );
}

export interface InfoBarEntryProps {
  readonly children: ReactNode;
}

InfoBar.Entry = function InfoBarEntry(props: InfoBarEntryProps): JSX.Element {
  return <div className="my-[5px] mr-5 ml-[5px] inline-block">{props.children}</div>;
};

export interface InfoBarKeyProps {
  readonly children: ReactNode;
}

InfoBar.Key = function InfoBarEntry(props: InfoBarKeyProps): JSX.Element {
  return <div className="text-xs whitespace-nowrap text-muted-foreground uppercase">{props.children}</div>;
};

export interface InfoBarValueProps {
  readonly children: ReactNode;
}

InfoBar.Value = function InfoBarEntry(props: InfoBarValueProps): JSX.Element {
  return <div className="text-base font-semibold whitespace-nowrap">{props.children}</div>;
};
