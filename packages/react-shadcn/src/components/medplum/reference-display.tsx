// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ReferenceDisplay/ReferenceDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MedplumLink } from '@/components/medplum/medplum-link';
import { stringify } from '@medplum/core';
import type { Reference } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface ReferenceDisplayProps {
  readonly value?: Reference;
  readonly link?: boolean;
}

export function ReferenceDisplay(props: ReferenceDisplayProps): JSX.Element | null {
  if (!props.value) {
    return null;
  }

  const displayString = props.value.display || props.value.reference || stringify(props.value);

  // The "link" prop defaults to "true"; undefined is treated as "true"
  // To disable the link, it must be explicitly "false"
  if (props.link !== false && props.value.reference) {
    return <MedplumLink to={props.value}>{displayString}</MedplumLink>;
  } else {
    return <>{displayString}</>;
  }
}
