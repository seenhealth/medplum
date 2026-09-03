// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodeableConceptInput/CodeableConceptInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptInput } from '@/components/medplum/codeable-concept-input';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/CodeableConceptInput',
  component: CodeableConceptInput,
} as Meta;

const valueSet = 'http://hl7.org/fhir/ValueSet/marital-status';

export const Basic = (): JSX.Element => (
  <Document>
    <CodeableConceptInput
      name="foo"
      binding={valueSet}
      onChange={console.log}
      path="Resource.blank"
      outcome={undefined}
    />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <CodeableConceptInput
      name="foo"
      binding={valueSet}
      defaultValue={{ coding: [{ code: 'M', display: 'Married' }] }}
      onChange={console.log}
      path={'Patient.maritalStatus'}
      outcome={undefined}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <CodeableConceptInput
      disabled
      name="foo"
      binding={valueSet}
      defaultValue={{ coding: [{ code: 'M', display: 'Married' }] }}
      onChange={console.log}
      path={'Patient.maritalStatus'}
      outcome={undefined}
    />
  </Document>
);
