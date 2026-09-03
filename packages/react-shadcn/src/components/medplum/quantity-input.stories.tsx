// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuantityInput/QuantityInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { QuantityInput } from '@/components/medplum/quantity-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/QuantityInput',
  component: QuantityInput,
} as Meta;

export const Example = (): JSX.Element => (
  <Document>
    <QuantityInput path="" name="demo" />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <QuantityInput
      path=""
      name="demo"
      defaultValue={{
        value: 10,
        comparator: '<',
        unit: 'mg',
      }}
    />
  </Document>
);

export const ScrollWheelDisabled = (): JSX.Element => (
  <Document>
    <QuantityInput
      path=""
      name="demo"
      disableWheel
      defaultValue={{
        value: 2.2,
        unit: 'ng',
      }}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <QuantityInput
      disabled
      path=""
      name="demo"
      defaultValue={{
        value: 10,
        comparator: '<',
        unit: 'mg',
      }}
    />
  </Document>
);

export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'MolecularSequence',
    elements: {},
    accessPolicyResource: {
      resourceType: 'MolecularSequence',
      readonlyFields: ['quantity.comparator', 'quantity.unit'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <QuantityInput
        path="MolecularSequence.quantity"
        name="demo"
        defaultValue={{
          value: 10,
          comparator: '<',
          unit: 'mg',
        }}
      />
    </Document>
  );
};
