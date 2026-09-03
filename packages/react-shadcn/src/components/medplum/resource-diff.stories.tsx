// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceDiff/ResourceDiff.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceDiff } from '@/components/medplum/resource-diff';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceDiff',
  component: ResourceDiff,
} as Meta;

export const Basic = (): JSX.Element => {
  const original = HomerSimpson;
  const revised = { ...HomerSimpson, name: [{ given: ['Homer', 'J.'], family: 'Sampson' }] };
  return (
    <Document>
      <ResourceDiff original={original} revised={revised} />
    </Document>
  );
};
