// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactDetailDisplay/ContactDetailDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactPointDisplay } from '@/components/medplum/contact-point-display';
import type { ContactDetail } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface ContactDetailDisplayProps {
  readonly value?: ContactDetail;
}

export function ContactDetailDisplay(props: ContactDetailDisplayProps): JSX.Element | null {
  const contactDetail = props.value;
  if (!contactDetail) {
    return null;
  }

  return (
    <>
      {contactDetail.name}
      {contactDetail.name && ': '}
      {contactDetail.telecom?.map((telecom) => (
        <ContactPointDisplay key={`telecom-${contactDetail.name}-${telecom.value}`} value={telecom} />
      ))}
    </>
  );
}
