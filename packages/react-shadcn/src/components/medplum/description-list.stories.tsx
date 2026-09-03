// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/DescriptionList/DescriptionList.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DescriptionList, DescriptionListEntry } from '@/components/medplum/description-list';
import { Panel } from '@/components/medplum/panel';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/DescriptionList',
  component: DescriptionList,
} as Meta;

export const Basic = (): JSX.Element => (
  <Panel>
    <DescriptionList>
      <DescriptionListEntry term="Term 1">Value 1</DescriptionListEntry>
      <DescriptionListEntry term="Term 2">Value 2</DescriptionListEntry>
      <DescriptionListEntry term="Term 3">Value 3</DescriptionListEntry>
    </DescriptionList>
  </Panel>
);
