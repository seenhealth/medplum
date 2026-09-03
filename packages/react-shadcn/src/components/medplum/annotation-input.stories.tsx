// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AnnotationInput/AnnotationInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AnnotationInput } from '@/components/medplum/annotation-input';
import { Document } from '@/components/medplum/document';
import { createReference } from '@medplum/core';
import { DrAliceSmith } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/AnnotationInput',
  component: AnnotationInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <AnnotationInput
      defaultValue={{
        authorReference: createReference(DrAliceSmith),
        text: 'This is an annotation',
      }}
      onChange={console.log}
      name="annotation"
      path="Extension.value[x]"
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <AnnotationInput
      disabled={true}
      defaultValue={{
        authorReference: createReference(DrAliceSmith),
        text: 'This is an annotation',
      }}
      onChange={console.log}
      name="annotation"
      path="Extension.value[x]"
    />
  </Document>
);
