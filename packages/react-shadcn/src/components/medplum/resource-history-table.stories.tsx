// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceHistoryTable/ResourceHistoryTable.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceHistoryTable } from '@/components/medplum/resource-history-table';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceHistoryTable',
  component: ResourceHistoryTable,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ResourceHistoryTable resourceType="Patient" id={HomerSimpson.id} />
  </Document>
);
