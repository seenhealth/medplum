// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PeriodInput/PeriodInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { PeriodInput } from '@/components/medplum/period-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/PeriodInput',
  component: PeriodInput,
} as Meta;

export const Example = (): JSX.Element => (
  <Document>
    <PeriodInput path="" name="demo" />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <PeriodInput
      path=""
      name="demo"
      defaultValue={{
        start: '2021-12-01T00:00:00.000Z',
        end: '2021-12-05T00:00:00.000Z',
      }}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <PeriodInput
      disabled
      path=""
      name="demo"
      defaultValue={{
        start: '2021-12-01T00:00:00.000Z',
        end: '2021-12-05T00:00:00.000Z',
      }}
    />
  </Document>
);

export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'Claim',
    elements: {},
    accessPolicyResource: {
      resourceType: 'Claim',
      readonlyFields: ['billablePeriod.end'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <PeriodInput
        path="Claim.billablePeriod"
        name="demo"
        defaultValue={{
          start: '2021-12-01T00:00:00.000Z',
          end: '2021-12-05T00:00:00.000Z',
        }}
      />
    </Document>
  );
};
