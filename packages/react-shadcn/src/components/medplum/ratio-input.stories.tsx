// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RatioInput/RatioInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { RatioInput } from '@/components/medplum/ratio-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/RatioInput',
  component: RatioInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <RatioInput
      path=""
      name="dosage"
      defaultValue={{
        numerator: { value: 10, unit: 'mg', system: 'http://unitsofmeasure.org' },
        denominator: { value: 1, unit: 'h', system: 'http://unitsofmeasure.org' },
      }}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <RatioInput
      disabled
      path=""
      name="dosage"
      defaultValue={{
        numerator: { value: 10, unit: 'mg', system: 'http://unitsofmeasure.org' },
        denominator: { value: 1, unit: 'h', system: 'http://unitsofmeasure.org' },
      }}
    />
  </Document>
);
export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'Medication',
    elements: {},
    accessPolicyResource: {
      resourceType: 'Medication',
      readonlyFields: ['amount.denominator'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <RatioInput
        path="Medication.amount"
        name="dosage"
        defaultValue={{
          numerator: { value: 10, unit: 'mg', system: 'http://unitsofmeasure.org' },
          denominator: { value: 1, unit: 'h', system: 'http://unitsofmeasure.org' },
        }}
      />
    </Document>
  );
};
