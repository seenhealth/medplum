// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ExtensionInput/ExtensionInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ExtensionInput } from '@/components/medplum/extension-input';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ExtensionInput',
  component: ExtensionInput,
} as Meta;

export const Basic = (): JSX.Element => (
  // https://www.hl7.org/fhir/extension-patient-interpreterrequired.html
  <Document>
    <ExtensionInput
      name="interpreterRequired"
      defaultValue={{ url: 'http://hl7.org/fhir/StructureDefinition/patient-interpreterRequired', valueBoolean: true }}
      path="Patient.interpreterRequired"
      onChange={undefined}
      outcome={undefined}
      propertyType={{ code: 'Extension' }}
    />
  </Document>
);
