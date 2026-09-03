// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodeInput/CodeInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeInput } from '@/components/medplum/code-input';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/CodeInput',
  component: CodeInput,
} as Meta;

const valueSet = 'http://hl7.org/fhir/ValueSet/marital-status';

export const Basic = (): JSX.Element => (
  <Document>
    <CodeInput name="foo" binding={valueSet} onChange={console.log} />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <CodeInput name="foo" binding={valueSet} defaultValue="bots" onChange={console.log} />
  </Document>
);
