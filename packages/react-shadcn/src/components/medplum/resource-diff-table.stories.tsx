// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceDiffTable/ResourceDiffTable.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceDiffTable } from '@/components/medplum/resource-diff-table';
import type { Patient } from '@medplum/fhirtypes';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceDiffTable',
  component: ResourceDiffTable,
} as Meta;

export const Basic = (): JSX.Element => {
  const original = HomerSimpson;
  const revised = {
    ...HomerSimpson,
    gender: 'unknown',
    name: [{ given: ['Homer', 'J.'], family: 'Sampson' }],
  } as Patient;
  return (
    <Document>
      <ResourceDiffTable original={original} revised={revised} />
    </Document>
  );
};
