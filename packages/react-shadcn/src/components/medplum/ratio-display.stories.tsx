// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RatioDisplay/RatioDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { RatioDisplay } from '@/components/medplum/ratio-display';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/RatioDisplay',
  component: RatioDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <RatioDisplay
      value={{
        numerator: { value: 10, unit: 'mg', system: 'http://unitsofmeasure.org' },
        denominator: { value: 1, unit: 'h', system: 'http://unitsofmeasure.org' },
      }}
    />
  </Document>
);
