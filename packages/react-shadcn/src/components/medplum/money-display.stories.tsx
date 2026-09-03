// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MoneyDisplay/MoneyDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { MoneyDisplay } from '@/components/medplum/money-display';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/MoneyDisplay',
  component: MoneyDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  //Use the ISO 4217 Currency Code to specify the currency type
  <Document>
    <MoneyDisplay value={{ value: 101.55, currency: 'USD' }} />
  </Document>
);
