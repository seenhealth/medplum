// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Document/Document.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/Document',
  component: Document,
} as Meta;

export const Basic = (): JSX.Element => <Document>Hello World</Document>;
