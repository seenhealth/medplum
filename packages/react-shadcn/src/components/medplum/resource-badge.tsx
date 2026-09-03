// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceBadge/ResourceBadge.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ResourceAvatar } from '@/components/medplum/resource-avatar';
import { ResourceName } from '@/components/medplum/resource-name';
import type { Reference, Resource } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface ResourceBadgeProps {
  readonly value?: Reference | Resource;
  readonly link?: boolean;
}

export function ResourceBadge(props: ResourceBadgeProps): JSX.Element {
  return (
    <div className="flex flex-nowrap items-center gap-2">
      <ResourceAvatar className="size-6" value={props.value} link={props.link} />
      <ResourceName value={props.value} link={props.link} />
    </div>
  );
}
