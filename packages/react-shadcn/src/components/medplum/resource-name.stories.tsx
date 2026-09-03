// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceName/ResourceName.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceName } from '@/components/medplum/resource-name';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceName',
  component: ResourceName,
} as Meta;

export const Resource = (): JSX.Element => (
  <Document>
    <ResourceName value={HomerSimpson} />
  </Document>
);

export const Reference = (): JSX.Element => (
  <Document>
    <ResourceName value={{ reference: 'Patient/123' }} />
  </Document>
);

export const Invalid = (): JSX.Element => (
  <Document>
    <ResourceName value={{ reference: 'Patient/xyz' }} />
  </Document>
);
