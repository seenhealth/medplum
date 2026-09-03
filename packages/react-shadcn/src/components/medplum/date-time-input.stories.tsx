// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/DateTimeInput/DateTimeInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/DateTimeInput',
  component: DateTimeInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <DateTimeInput name="demo" onChange={console.log} />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <DateTimeInput name="demo" onChange={console.log} disabled />
  </Document>
);
