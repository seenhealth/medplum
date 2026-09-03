// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentArrayInput/AttachmentArrayInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentArrayInput } from '@/components/medplum/attachment-array-input';
import { Document } from '@/components/medplum/document';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/AttachmentArrayInput',
  component: AttachmentArrayInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <AttachmentArrayInput name="photo" />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <AttachmentArrayInput name="photo" defaultValue={[{ title: 'default.png' }]} />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <AttachmentArrayInput name="photo" defaultValue={[{}]} disabled={true} />
  </Document>
);
