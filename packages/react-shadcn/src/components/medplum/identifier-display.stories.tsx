// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/IdentifierDisplay/IdentifierDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { IdentifierDisplay } from '@/components/medplum/identifier-display';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/IdentifierDisplay',
  component: IdentifierDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <IdentifierDisplay
      value={{
        system: 'http://hl7.org/fhir/sid/us-ssn',
        value: '011-11-1234',
      }}
    />
  </Document>
);
