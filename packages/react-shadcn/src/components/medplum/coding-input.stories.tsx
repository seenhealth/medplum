// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodingInput/CodingInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodingInput } from '@/components/medplum/coding-input';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/CodingInput',
  component: CodingInput,
} as Meta;

const valueSet = 'http://hl7.org/fhir/ValueSet/marital-status';

export const Basic = (): JSX.Element => (
  <Document>
    <CodingInput path="" binding={valueSet} name="code" />
  </Document>
);

export const WithWrapperText = (): JSX.Element => (
  <Document>
    <CodingInput path="" binding={valueSet} name="code" label="My Label" description="My help text" />
  </Document>
);

export const WithError = (): JSX.Element => (
  <Document>
    <CodingInput path="" binding={valueSet} name="code" label="My Label" description="My help text" error="My error" />
  </Document>
);

export const MultipleValues = (): JSX.Element => (
  <Document>
    <CodingInput path="" binding={valueSet} name="code" label="Max Values 2" maxValues={2} />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <CodingInput
      path=""
      binding={valueSet}
      name="code"
      label="My Label"
      defaultValue={{ display: 'display' }}
      disabled
    />
  </Document>
);
