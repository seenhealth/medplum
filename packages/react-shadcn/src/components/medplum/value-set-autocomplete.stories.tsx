// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ValueSetAutocomplete/ValueSetAutocomplete.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ValueSetAutocomplete } from '@/components/medplum/value-set-autocomplete';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ValueSetAutocomplete',
  component: ValueSetAutocomplete,
} as Meta;

export const Single = (): JSX.Element => (
  <Document>
    <ValueSetAutocomplete binding="x" onChange={console.log} maxValues={1} />
  </Document>
);

export const Multiple = (): JSX.Element => (
  <Document>
    <ValueSetAutocomplete binding="x" onChange={console.log} maxValues={3} />
  </Document>
);

export const MinimumInput = (): JSX.Element => (
  <Document>
    <ValueSetAutocomplete binding="x" onChange={console.log} maxValues={3} minInputLength={3} />
  </Document>
);
