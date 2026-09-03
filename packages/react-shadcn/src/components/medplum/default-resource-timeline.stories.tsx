// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/DefaultResourceTimeline/DefaultResourceTimeline.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DefaultResourceTimeline } from '@/components/medplum/default-resource-timeline';
import { Document } from '@/components/medplum/document';
import { withMockedDate } from '@/stories/decorators';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/DefaultResourceTimeline',
  component: DefaultResourceTimeline,
  decorators: [withMockedDate],
} as Meta;

export const Basic = (): JSX.Element | null => {
  return (
    <Document>
      <DefaultResourceTimeline resource={HomerSimpson} />
    </Document>
  );
};
