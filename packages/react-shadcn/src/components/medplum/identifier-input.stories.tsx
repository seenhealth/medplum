// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/IdentifierInput/IdentifierInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { IdentifierInput } from '@/components/medplum/identifier-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/IdentifierInput',
  component: IdentifierInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <IdentifierInput
      name="patient-identifier"
      path="Patient.identifier"
      defaultValue={{
        system: 'http://hl7.org/fhir/sid/us-ssn',
        value: '011-11-1234',
      }}
      onChange={console.log}
      outcome={undefined}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <IdentifierInput
      disabled
      name="patient-identifier"
      path="Patient.identifier"
      defaultValue={{
        system: 'http://hl7.org/fhir/sid/us-ssn',
        value: '011-11-1234',
      }}
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
      readonlyFields: ['identifier.system'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <IdentifierInput
        name="patient-identifier"
        path="Patient.identifier"
        defaultValue={{
          system: 'http://hl7.org/fhir/sid/us-ssn',
          value: '011-11-1234',
        }}
        onChange={console.log}
        outcome={undefined}
      />
    </Document>
  );
};
