// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/TimingInput/TimingInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { TimingInput } from '@/components/medplum/timing-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/TimingInput',
  component: TimingInput,
} as Meta;

export const Example = (): JSX.Element => (
  <Document>
    <TimingInput name="demo" path="Extension.value[x]" />
  </Document>
);

export const DefaultValue = (): JSX.Element => (
  <Document>
    <TimingInput
      name="demo"
      path="Extension.value[x]"
      defaultValue={{
        repeat: {
          periodUnit: 'wk',
          dayOfWeek: ['mon', 'wed', 'fri'],
          timeOfDay: ['09:00:00', '12:00:00', '03:00:00'],
        },
      }}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <TimingInput
      disabled
      name="demo"
      path="Extension.value[x]"
      defaultValue={{
        repeat: {
          periodUnit: 'wk',
          dayOfWeek: ['mon', 'wed', 'fri'],
          timeOfDay: ['09:00:00', '12:00:00', '03:00:00'],
        },
      }}
    />
  </Document>
);

export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'NutritionOrder',
    elements: {},
    accessPolicyResource: {
      resourceType: 'NutritionOrder',
      readonlyFields: [
        'oralDiet.schedule.event',
        'oralDiet.schedule.repeat.period',
        'oralDiet.schedule.repeat.dayOfWeek',
      ],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document className="h-[500px]">
      <TimingInput
        name="demo"
        path="NutritionOrder.oralDiet.schedule"
        defaultModalOpen
        defaultValue={{
          repeat: {
            periodUnit: 'wk',
            dayOfWeek: ['mon', 'wed', 'fri'],
            timeOfDay: ['09:00:00', '12:00:00', '03:00:00'],
          },
        }}
      />
    </Document>
  );
};
