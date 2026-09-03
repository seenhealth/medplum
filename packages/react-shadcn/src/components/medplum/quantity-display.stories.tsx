// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuantityDisplay/QuantityDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { QuantityDisplay } from '@/components/medplum/quantity-display';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/QuantityDisplay',
  component: QuantityDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <QuantityDisplay
      value={{
        value: 10,
        comparator: '<',
        unit: 'mg',
      }}
    />
  </Document>
);
