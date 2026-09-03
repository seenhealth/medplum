// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AddressDisplay/AddressDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AddressDisplay } from '@/components/medplum/address-display';
import { Document } from '@/components/medplum/document';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/AddressDisplay',
  component: AddressDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <AddressDisplay value={HomerSimpson.address?.[0]} />
  </Document>
);
