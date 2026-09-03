// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuantityDisplay/QuantityDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { formatQuantity } from '@medplum/core';
import type { Quantity } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface QuantityDisplayProps {
  readonly value?: Quantity;
  readonly precision?: number;
}

export function QuantityDisplay(props: QuantityDisplayProps): JSX.Element | null {
  return <>{formatQuantity(props.value, props.precision)}</>;
}
