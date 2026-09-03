// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/BackboneElementDisplay/BackboneElementDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { BackboneElementDisplay } from '@/components/medplum/backbone-element-display';
import { Document } from '@/components/medplum/document';
import type { PatientContact } from '@medplum/fhirtypes';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/BackboneElementDisplay',
  component: BackboneElementDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <BackboneElementDisplay
      path="Patient.contact"
      value={{
        type: 'PatientContact',
        value: {
          id: '123',
          name: {
            given: ['John'],
            family: 'Doe',
          },
        } as PatientContact,
      }}
    />
  </Document>
);

export const IgnoreMissingValues = (): JSX.Element => (
  <Document>
    <BackboneElementDisplay
      path="Patient.contact"
      value={{
        type: 'PatientContact',
        value: {
          id: '123',
          name: {
            given: ['John'],
            family: 'Doe',
          },
        },
      }}
      ignoreMissingValues
    />
  </Document>
);
