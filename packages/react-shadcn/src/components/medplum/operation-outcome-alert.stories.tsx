// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/OperationOutcomeAlert/OperationOutcomeAlert.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { OperationOutcomeAlert } from '@/components/medplum/operation-outcome-alert';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/OperationOutcomeAlert',
  component: OperationOutcomeAlert,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <OperationOutcomeAlert
      outcome={{
        resourceType: 'OperationOutcome',
        id: 'not-found',
        issue: [
          {
            severity: 'error',
            code: 'not-found',
            details: { text: 'Not found' },
          },
        ],
      }}
    />
  </Document>
);

export const Issues = (): JSX.Element => (
  <Document>
    <OperationOutcomeAlert
      issues={[
        {
          severity: 'error',
          code: 'not-found',
          details: { text: 'Not found' },
        },
        {
          severity: 'warning',
          code: 'too-costly',
          details: { text: 'Too Costly' },
        },
      ]}
    />
  </Document>
);
