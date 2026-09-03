// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Timeline/Timeline.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Container } from '@/components/medplum/container';
import { ErrorBoundary } from '@/components/medplum/error-boundary';
import { MedplumLink } from '@/components/medplum/medplum-link';
import { Panel } from '@/components/medplum/panel';
import { ResourceAvatar } from '@/components/medplum/resource-avatar';
import { ResourceName } from '@/components/medplum/resource-name';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDateTime, getReferenceString } from '@medplum/core';
import type { Reference, Resource } from '@medplum/fhirtypes';
import { IconDots } from '@tabler/icons-react';
import type { ComponentProps, JSX, ReactElement, ReactNode } from 'react';
import { Children, isValidElement } from 'react';

export interface TimelineProps {
  readonly children?: ReactNode;
}

export function Timeline(props: TimelineProps): JSX.Element {
  return <Container>{props.children}</Container>;
}

export type TimelineItemProps<T extends Resource = Resource> = Omit<ComponentProps<'div'>, 'resource'> & {
  readonly resource: T;
  readonly profile?: Reference;
  readonly dateTime?: string;
  readonly padding?: boolean;
};

export function TimelineItemMenu({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuContent>): JSX.Element {
  return (
    <DropdownMenuContent data-slot="timeline-item-menu" align="end" className={cn('w-[200px]', className)} {...props}>
      {children}
    </DropdownMenuContent>
  );
}

function splitTimelineItemMenu(children: ReactNode): { menu?: ReactElement; content: ReactNode } {
  const content: ReactNode[] = [];
  let menu: ReactElement | undefined;
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === TimelineItemMenu) {
      menu = child;
    } else {
      content.push(child);
    }
  });
  return { menu, content };
}

export function TimelineItem(props: TimelineItemProps): JSX.Element {
  const { resource, profile, padding, dateTime: dateTimeProp, className, children, ...others } = props;
  const author = profile ?? resource.meta?.author;
  const onBehalfOf = resource.meta?.onBehalfOf;
  const dateTime = dateTimeProp ?? resource.meta?.lastUpdated;
  const { menu, content } = splitTimelineItemMenu(children);

  return (
    <Panel data-testid="timeline-item" className={cn('p-0', className)} {...others}>
      <div className="mx-2 my-3 flex items-center justify-between gap-2">
        <ResourceAvatar value={author} link={true} />
        <div className="flex-1">
          <p className="text-sm">
            <ResourceName className="font-medium text-inherit" value={author} link={true} />
            {onBehalfOf && (
              <span className="text-xs text-muted-foreground">
                {' on behalf of '}
                <ResourceName className="text-inherit" value={onBehalfOf} link={true} />
              </span>
            )}
          </p>
          <p className="text-xs">
            <MedplumLink className="text-muted-foreground" to={props.resource}>
              {formatDateTime(dateTime)}
            </MedplumLink>
            <span className="mx-2 text-muted-foreground">&middot;</span>
            <MedplumLink className="text-muted-foreground" to={props.resource}>
              {props.resource.resourceType}
            </MedplumLink>
          </p>
        </div>
        {menu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${getReferenceString(props.resource)}`}>
                <IconDots />
              </Button>
            </DropdownMenuTrigger>
            {menu}
          </DropdownMenu>
        )}
      </div>
      <ErrorBoundary>
        <div className={cn('whitespace-pre-wrap', padding && 'px-4 pb-4')}>{content}</div>
      </ErrorBoundary>
    </Panel>
  );
}
