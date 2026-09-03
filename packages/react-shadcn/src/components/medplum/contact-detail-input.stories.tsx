// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactDetailInput/ContactDetailInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactDetailInput } from '@/components/medplum/contact-detail-input';
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ContactDetailInput',
  component: ContactDetailInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ContactDetailInput
      defaultValue={{
        name: 'Foo',
        telecom: [
          {
            use: 'home',
            system: 'email',
            value: 'abc@example.com',
          },
        ],
      }}
      onChange={console.log}
      name="contact"
      path="Patient.contact"
      outcome={undefined}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <ContactDetailInput
      disabled
      defaultValue={{
        name: 'Foo',
        telecom: [
          {
            use: 'home',
            system: 'email',
            value: 'abc@example.com',
          },
        ],
      }}
      onChange={console.log}
      name="contact"
      path="Patient.contact"
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
      readonlyFields: ['contact.telecom.use', 'contact.name'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <ContactDetailInput
        defaultValue={{
          name: 'Foo',
          telecom: [
            {
              use: 'home',
              system: 'email',
              value: 'abc@example.com',
            },
          ],
        }}
        onChange={console.log}
        name="contact"
        path="Patient.contact"
        outcome={undefined}
      />
    </Document>
  );
};
