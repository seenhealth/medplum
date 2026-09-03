// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RatioDisplay/RatioDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { QuantityDisplay } from '@/components/medplum/quantity-display';
import type { Ratio } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface RatioDisplayProps {
  readonly value?: Ratio;
  readonly precision?: number;
}

export function RatioDisplay(props: RatioDisplayProps): JSX.Element | null {
  const value = props.value;
  if (!value) {
    return null;
  }

  return (
    <>
      <QuantityDisplay value={value.numerator} precision={props.precision} />
      &nbsp;/&nbsp;
      <QuantityDisplay value={value.denominator} precision={props.precision} />
    </>
  );
}
