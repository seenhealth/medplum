// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentInput/AttachmentInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentInput } from '@/components/medplum/attachment-input';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/AttachmentInput',
  component: AttachmentInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <AttachmentInput path="" name="attachment" />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <AttachmentInput path="" name="attachment" defaultValue={{}} />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <AttachmentInput path="" name="attachment" defaultValue={{}} disabled />
  </Document>
);
