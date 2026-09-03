// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/BackboneElementInput/BackboneElementInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { BackboneElementInput } from '@/components/medplum/backbone-element-input';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/BackboneElementInput',
  component: BackboneElementInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <BackboneElementInput typeName="PatientContact" path="Patient.contact" />
  </Document>
);
