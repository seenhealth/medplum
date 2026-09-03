// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchFieldEditor/SearchFieldEditor.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { SearchFieldEditor } from '@/components/medplum/search-field-editor';
import type { SearchRequest } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';
import { useState } from 'react';

export default {
  title: 'Medplum/SearchFieldEditor',
  component: SearchFieldEditor,
} as Meta;

export const Basic = (): JSX.Element => {
  const [curSearch, setCurSearch] = useState<SearchRequest>({
    resourceType: 'Patient',
    fields: ['name'],
  });

  return (
    <SearchFieldEditor search={curSearch} visible={true} onOk={setCurSearch} onCancel={() => console.log('onCancel')} />
  );
};
