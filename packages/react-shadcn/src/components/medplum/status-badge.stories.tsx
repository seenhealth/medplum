// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/StatusBadge/StatusBadge.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { StatusBadge } from '@/components/medplum/status-badge';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/StatusBadge',
  component: StatusBadge,
} as Meta;

export const ExampleStatuses = (): JSX.Element => (
  <Document>
    <div className="leading-[200%]">
      <div>
        Status: <StatusBadge status="active" />
      </div>
      <div>
        Status: <StatusBadge status="on-hold" />
      </div>
      <div>
        Status: <StatusBadge status="completed" />
      </div>
      <div>
        Status: <StatusBadge status="cancelled" />
      </div>
      <div>
        Status: <StatusBadge status="entered-in-error" />
      </div>
      <div>
        Status: <StatusBadge status="unknown" />
      </div>
    </div>
  </Document>
);
