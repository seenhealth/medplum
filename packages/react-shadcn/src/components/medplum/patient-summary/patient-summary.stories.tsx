// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/PatientSummary.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { PatientSummary } from '@/components/medplum/patient-summary/patient-summary';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/PatientSummary',
  component: PatientSummary,
} as Meta;

export const Patient = (): JSX.Element => (
  <div className="w-[350px]">
    <PatientSummary patient={HomerSimpson} />
  </div>
);
