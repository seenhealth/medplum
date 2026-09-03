// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MoneyInput/MoneyInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { MoneyInput } from '@/components/medplum/money-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/MoneyInput',
  component: MoneyInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <MoneyInput path="" name="demo" onChange={console.log} />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <MoneyInput path="" name="demo" onChange={console.log} defaultValue={{ value: 101.55, currency: 'USD' }} />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <MoneyInput disabled path="" name="demo" onChange={console.log} defaultValue={{ value: 101.55, currency: 'USD' }} />
  </Document>
);

export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'Claim',
    elements: {},
    accessPolicyResource: {
      resourceType: 'Claim',
      readonlyFields: ['total.currency'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <MoneyInput
        path="Claim.total"
        name="demo"
        onChange={console.log}
        defaultValue={{ value: 101.55, currency: 'USD' }}
      />
    </Document>
  );
};
