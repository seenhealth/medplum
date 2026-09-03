// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceAvatar/ResourceAvatar.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MedplumLink } from '@/components/medplum/medplum-link';
import { getInitials } from '@/components/medplum/resource-avatar-utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getDisplayString, getImageSrc } from '@medplum/core';
import type { Reference, Resource } from '@medplum/fhirtypes';
import { useCachedBinaryUrl, useResource } from '@medplum/react-hooks';
import type { ComponentProps, JSX } from 'react';

export interface ResourceAvatarProps extends ComponentProps<typeof Avatar> {
  readonly value?: Reference | Resource;
  readonly link?: boolean;
  readonly src?: string;
  readonly alt?: string;
}

export function ResourceAvatar(props: ResourceAvatarProps): JSX.Element {
  const resource = useResource(props.value);
  const text = resource ? getDisplayString(resource) : (props.alt ?? '');
  const initials = getInitials(text);
  const uncachedImageUrl = (resource && getImageSrc(resource)) ?? props.src;
  const imageUrl = useCachedBinaryUrl(uncachedImageUrl ?? undefined);

  const { value: _value, link: _link, src: _src, alt: _alt, ...avatarProps } = props;

  const avatar = (
    <Avatar title={text} {...avatarProps}>
      <img alt={text} src={imageUrl} className="aspect-square size-full" />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );

  if (props.link) {
    return <MedplumLink to={resource}>{avatar}</MedplumLink>;
  }

  return avatar;
}
