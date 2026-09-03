// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/IdentifierDisplay/IdentifierDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { Identifier } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface IdentifierDisplayProps {
  readonly value?: Identifier;
}

export function IdentifierDisplay(props: IdentifierDisplayProps): JSX.Element {
  return (
    <div>
      {props.value?.system}: {props.value?.value}
    </div>
  );
}
