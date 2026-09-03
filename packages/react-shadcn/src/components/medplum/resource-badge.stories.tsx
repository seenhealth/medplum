// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceBadge/ResourceBadge.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceBadge } from '@/components/medplum/resource-badge';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceBadge',
  component: ResourceBadge,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ResourceBadge value={HomerSimpson} />
  </Document>
);
