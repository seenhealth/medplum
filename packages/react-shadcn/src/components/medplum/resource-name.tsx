// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceName/ResourceName.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MedplumLink } from '@/components/medplum/medplum-link';
import { getDisplayString, isOk, normalizeErrorString } from '@medplum/core';
import type { OperationOutcome, Reference, Resource } from '@medplum/fhirtypes';
import { useResource } from '@medplum/react-hooks';
import type { ComponentProps, JSX } from 'react';
import { useState } from 'react';

export interface ResourceNameProps extends Omit<ComponentProps<'span'>, 'ref'> {
  readonly value?: Reference | Resource;
  readonly link?: boolean;
}

export function ResourceName(props: ResourceNameProps): JSX.Element | null {
  const { value, link, ...rest } = props;
  const [outcome, setOutcome] = useState<OperationOutcome | undefined>();
  const resource = useResource(value, setOutcome);
  let text: string;

  if (outcome && !isOk(outcome)) {
    text = `[${normalizeErrorString(outcome)}]`;
  } else if (resource) {
    text = getDisplayString(resource);
  } else {
    return null;
  }

  return link ? (
    <MedplumLink to={value} {...rest}>
      {text}
    </MedplumLink>
  ) : (
    <span {...rest}>{text}</span>
  );
}
