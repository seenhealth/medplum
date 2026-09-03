// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactDetailDisplay/ContactDetailDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactDetailDisplay } from '@/components/medplum/contact-detail-display';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ContactDetailDisplay',
  component: ContactDetailDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ContactDetailDisplay value={{ name: 'Foo', telecom: [{ value: 'homer@example.com' }] }} />
  </Document>
);
