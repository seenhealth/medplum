// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentArrayDisplay/AttachmentArrayDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentArrayDisplay } from '@/components/medplum/attachment-array-display';
import { Document } from '@/components/medplum/document';
import type { Attachment } from '@medplum/fhirtypes';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/AttachmentArrayDisplay',
  component: AttachmentArrayDisplay,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <AttachmentArrayDisplay
      values={
        [
          { url: 'http://example.com/file1', title: 'file1.txt' },
          { url: 'http://example.com/file2', title: 'file2.png' },
        ] as Attachment[]
      }
    />
  </Document>
);
