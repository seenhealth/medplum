// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/HumanNameDisplay/HumanNameDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { HumanNameFormatOptions } from '@medplum/core';
import { formatHumanName } from '@medplum/core';
import type { HumanName } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface HumanNameDisplayProps {
  readonly value?: HumanName;
  readonly options?: HumanNameFormatOptions;
}

export function HumanNameDisplay(props: HumanNameDisplayProps): JSX.Element | null {
  const name = props.value;
  if (!name) {
    return null;
  }

  return <>{formatHumanName(name, props.options)}</>;
}
