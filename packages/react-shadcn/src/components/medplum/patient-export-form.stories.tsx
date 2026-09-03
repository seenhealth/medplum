// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientExportForm/PatientExportForm.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { PatientExportForm } from '@/components/medplum/patient-export-form';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/PatientExportForm',
  component: PatientExportForm,
} as Meta;

export const Example = (): JSX.Element => (
  <Document>
    <h1 className="text-2xl font-semibold tracking-tight">Patient Export</h1>
    <PatientExportForm patient={HomerSimpson} />
  </Document>
);
