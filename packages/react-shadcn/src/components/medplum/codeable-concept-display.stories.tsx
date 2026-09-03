// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodeableConceptDisplay/CodeableConceptDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptDisplay } from '@/components/medplum/codeable-concept-display';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/CodeableConceptDisplay',
  component: CodeableConceptDisplay,
} as Meta;

export const Empty = (): JSX.Element => (
  <Document>
    <CodeableConceptDisplay />
  </Document>
);

export const TextValue = (): JSX.Element => (
  <Document>
    <CodeableConceptDisplay value={{ text: 'Negative' }} />
  </Document>
);

export const CodeValue = (): JSX.Element => (
  <Document>
    <CodeableConceptDisplay
      value={{
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '260385009',
            display: 'Negative',
          },
        ],
      }}
    />
  </Document>
);

export const MultipleValues = (): JSX.Element => (
  <Document>
    <CodeableConceptDisplay
      value={{
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '389145006',
            display: 'Allergic Asthma',
          },
          {
            system: 'urn:oid:2.16.840.1.113883.6.42',
            code: '493.00',
            display: 'Extrinsic asthma',
          },
        ],
      }}
    />
  </Document>
);
