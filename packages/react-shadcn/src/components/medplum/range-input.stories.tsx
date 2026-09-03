// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RangeInput/RangeInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { RangeInput } from '@/components/medplum/range-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/RangeInput',
  component: RangeInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <RangeInput
      path=""
      name="range"
      defaultValue={{
        low: {
          comparator: '>',
          value: 10,
          unit: 'mg',
        },
      }}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <RangeInput
      disabled
      path=""
      name="range"
      defaultValue={{
        low: {
          comparator: '>',
          value: 10,
          unit: 'mg',
        },
      }}
    />
  </Document>
);

export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'SpecimenDefinition',
    elements: {},
    accessPolicyResource: {
      resourceType: 'SpecimenDefinition',
      readonlyFields: ['handling.temperatureRange.high'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <RangeInput
        path="SpecimenDefinition.handling.temperatureRange"
        name="range"
        defaultValue={{
          low: {
            comparator: '>',
            value: 10,
            unit: 'mg',
          },
        }}
      />
    </Document>
  );
};
