// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactPointInput/ContactPointInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactPointInput } from '@/components/medplum/contact-point-input';
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ContactPointInput',
  component: ContactPointInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ContactPointInput
      name="test"
      path="Patient.contact"
      defaultValue={{ use: 'home', system: 'email', value: 'homer@example.com' }}
      onChange={console.log}
      outcome={undefined}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <ContactPointInput
      disabled
      name="test"
      path="Patient.contact"
      defaultValue={{ use: 'home', system: 'email', value: 'homer@example.com' }}
      onChange={console.log}
      outcome={undefined}
    />
  </Document>
);

export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'Patient',
    elements: {},
    accessPolicyResource: {
      resourceType: 'Patient',
      readonlyFields: ['contact.telecom.system', 'contact.telecom.value'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }
  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <ContactPointInput
        name="test"
        path="Patient.contact.telecom"
        defaultValue={{ use: 'home', system: 'email', value: 'homer@example.com' }}
        onChange={console.log}
        outcome={undefined}
      />
    </Document>
  );
};
