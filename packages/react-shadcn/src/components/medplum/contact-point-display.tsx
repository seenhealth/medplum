// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactPointDisplay/ContactPointDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ContactPoint } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface ContactPointDisplayProps {
  readonly value?: ContactPoint;
}

export function ContactPointDisplay(props: ContactPointDisplayProps): JSX.Element | null {
  const contactPoint = props.value;
  if (!contactPoint) {
    return null;
  }

  const builder = [];

  if (contactPoint.value) {
    builder.push(contactPoint.value);
  }

  if (contactPoint.use || contactPoint.system) {
    builder.push(' [');

    if (contactPoint.use) {
      builder.push(contactPoint.use);
    }

    if (contactPoint.use && contactPoint.system) {
      builder.push(' ');
    }

    if (contactPoint.system) {
      builder.push(contactPoint.system);
    }

    builder.push(']');
  }

  return <>{builder.join('').trim()}</>;
}
