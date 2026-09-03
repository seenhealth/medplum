// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SignatureInput/SignatureInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { SignatureInput } from '@/components/medplum/signature-input';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/SignatureInput',
  component: SignatureInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <SignatureInput onChange={console.log} />
  </Document>
);
