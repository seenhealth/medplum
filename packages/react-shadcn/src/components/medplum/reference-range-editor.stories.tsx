// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ReferenceRangeEditor/ReferenceRangeEditor.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ErrorBoundary } from '@/components/medplum/error-boundary';
import { ReferenceRangeEditor } from '@/components/medplum/reference-range-editor';
import { HDLDefinition, KidneyLabDefinition, TestosteroneDefinition } from '@/stories/reference-lab';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ReferenceRangeEditor',
  component: ReferenceRangeEditor,
} as Meta;

export const Empty = (): JSX.Element => {
  return (
    <Document>
      <ErrorBoundary>
        <ReferenceRangeEditor
          definition={{ resourceType: 'ObservationDefinition' } as ObservationDefinition}
          onSubmit={(definition) => console.dir(definition, { depth: null })}
        />
      </ErrorBoundary>
    </Document>
  );
};

export const HDL = (): JSX.Element => {
  return (
    <Document>
      <ErrorBoundary>
        <ReferenceRangeEditor
          definition={HDLDefinition}
          onSubmit={(definition) => console.debug('Definition', definition)}
        />
      </ErrorBoundary>
    </Document>
  );
};

export const Testosterone = (): JSX.Element => {
  return (
    <Document>
      <ErrorBoundary>
        <ReferenceRangeEditor
          definition={TestosteroneDefinition}
          onSubmit={(definition) => console.debug('Definition', definition)}
        />
      </ErrorBoundary>
    </Document>
  );
};

export const ACR = (): JSX.Element => {
  return (
    <Document>
      <ErrorBoundary>
        <ReferenceRangeEditor
          definition={KidneyLabDefinition}
          onSubmit={(definition) => console.debug('Definition', definition)}
        />
      </ErrorBoundary>
    </Document>
  );
};
