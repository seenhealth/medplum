// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactPointDisplay/ContactPointDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactPointDisplay } from '@/components/medplum/contact-point-display';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ContactPointDisplay',
  component: ContactPointDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ContactPointDisplay value={{ use: 'home', system: 'email', value: 'homer@example.com' }} />
  </Document>
);
