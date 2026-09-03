// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceBlame/ResourceBlame.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceBlame } from '@/components/medplum/resource-blame/resource-blame';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceBlame',
  component: ResourceBlame,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ResourceBlame resourceType="Patient" id={HomerSimpson.id} />
  </Document>
);
