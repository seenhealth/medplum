// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ErrorBoundary/ErrorBoundary.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ErrorBoundary } from '@/components/medplum/error-boundary';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ErrorBoundary',
  component: ErrorBoundary,
} as Meta;

function ErrorComponent(): JSX.Element {
  throw new Error('Error');
}

export const Basic = (): JSX.Element => {
  return (
    <Document>
      <div>Outside Error Boundary</div>
      <ErrorBoundary>
        <div>Inside Error Boundary</div>
        <ErrorComponent />
      </ErrorBoundary>
    </Document>
  );
};
