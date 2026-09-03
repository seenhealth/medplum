// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RangeDisplay/RangeDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { formatRange } from '@medplum/core';
import type { Range } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface RangeDisplayProps {
  readonly value?: Range;
  readonly precision?: number;
  readonly exclusive?: boolean;
}

export function RangeDisplay(props: RangeDisplayProps): JSX.Element | null {
  return <>{formatRange(props.value, props.precision, props.exclusive)}</>;
}
