// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RangeDisplay/RangeDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { RangeDisplay } from '@/components/medplum/range-display';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/RangeDisplay',
  component: RangeDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <RangeDisplay
      value={{
        low: {
          value: 10,
          unit: 'mg',
        },
        high: {
          value: 11.2,
          unit: 'mg',
        },
      }}
    />
  </Document>
);

export const HighOnly = (): JSX.Element => (
  <Document>
    <RangeDisplay
      value={{
        high: {
          value: 11.2,
          unit: 'mg',
        },
      }}
    />
  </Document>
);

export const LowOnly = (): JSX.Element => (
  <Document>
    <RangeDisplay
      value={{
        low: {
          value: 10,
          unit: 'mg',
        },
      }}
    />
  </Document>
);
