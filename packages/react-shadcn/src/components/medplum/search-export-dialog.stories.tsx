// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchExportDialog/SearchExportDialog.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { SearchExportDialog } from '@/components/medplum/search-export-dialog';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/SearchExportDialog',
  component: SearchExportDialog,
} as Meta;

export const Basic = (): JSX.Element => {
  return (
    <SearchExportDialog
      visible={true}
      onCancel={() => console.log('onCancel')}
      exportCsv={() => console.log('export')}
    />
  );
};
