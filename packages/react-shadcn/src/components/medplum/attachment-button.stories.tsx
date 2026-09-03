// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentButton/AttachmentButton.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentButton } from '@/components/medplum/attachment-button';
import { Document } from '@/components/medplum/document';
import { Button } from '@/components/ui/button';
import type { Meta } from '@storybook/react';
import { IconCloudUpload } from '@tabler/icons-react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/AttachmentButton',
  component: AttachmentButton,
} as Meta;

export const Example = (): JSX.Element => (
  <Document>
    <AttachmentButton onUpload={console.log}>{(props) => <Button {...props}>Upload</Button>}</AttachmentButton>
  </Document>
);

export const CustomText = (): JSX.Element => (
  <Document>
    <AttachmentButton onUpload={console.log}>{(props) => <Button {...props}>My text</Button>}</AttachmentButton>
  </Document>
);

export const CustomComponent = (): JSX.Element => (
  <Document>
    <AttachmentButton onUpload={console.log}>
      {(props) => (
        <Button {...props} variant="default" size="icon">
          <IconCloudUpload size={16} />
        </Button>
      )}
    </AttachmentButton>
  </Document>
);
