// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/HumanNameDisplay/HumanNameDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { HumanNameDisplay } from '@/components/medplum/human-name-display';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/HumanNameDisplay',
  component: HumanNameDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <HumanNameDisplay value={{ prefix: ['Mr.'], given: ['Homer', 'J.'], family: 'Simpson' }} />
  </Document>
);
