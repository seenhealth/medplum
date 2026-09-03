// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodingDisplay/CodingDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { formatCoding } from '@medplum/core';
import type { Coding } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface CodingDisplayProps {
  readonly value?: Coding;
  readonly includeCode?: boolean;
}

export function CodingDisplay(props: CodingDisplayProps): JSX.Element {
  return <>{formatCoding(props.value, props.includeCode)}</>;
}
