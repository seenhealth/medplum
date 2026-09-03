// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MedplumLink/MedplumLink.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { isAuxClick } from '@/lib/medplum/dom';
import { cn } from '@/lib/utils';
import { isReference, isResource } from '@medplum/core';
import type { Reference, Resource } from '@medplum/fhirtypes';
import { useMedplumNavigate } from '@medplum/react-hooks';
import type { ComponentProps, JSX, MouseEvent, MouseEventHandler, ReactNode } from 'react';

export interface MedplumLinkProps extends ComponentProps<'a'> {
  readonly to?: Resource | Reference | string;
  readonly suffix?: string;
  readonly label?: string;
  readonly onClick?: MouseEventHandler;
  readonly children: ReactNode;
}

export function MedplumLink(props: MedplumLinkProps): JSX.Element {
  const navigate = useMedplumNavigate();
  const { to, suffix, label, onClick, children, className, ...rest } = props;

  let href = getHref(to);
  if (suffix) {
    href += '/' + suffix;
  }

  return (
    <a
      href={href}
      aria-label={label}
      className={cn('text-primary underline-offset-4 hover:underline', className)}
      onAuxClick={(e: MouseEvent) => {
        // allow default browser behavior for anchor aux clicks
        e.stopPropagation();
      }}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
          // onClick() takes the place of default anchor click behavior
          e.preventDefault();
          onClick(e);
        } else if (to) {
          // allow default browser behavior for anchor aux clicks
          if (!isAuxClick(e)) {
            // navigate() takes the place of default anchor click behavior
            e.preventDefault();
            navigate(href);
          }
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

function getHref(to: Resource | Reference | string | undefined): string {
  if (to) {
    if (typeof to === 'string') {
      return getStringHref(to);
    } else if (isResource(to)) {
      return getResourceHref(to);
    } else if (isReference(to)) {
      return getReferenceHref(to);
    }
  }
  return '#';
}

function getStringHref(to: string): string {
  if (to.startsWith('http://') || to.startsWith('https://') || to.startsWith('/')) {
    return to;
  }
  return '/' + to;
}

function getResourceHref(to: Resource): string {
  return `/${to.resourceType}/${to.id}`;
}

function getReferenceHref(to: Reference): string {
  return `/${to.reference}`;
}
