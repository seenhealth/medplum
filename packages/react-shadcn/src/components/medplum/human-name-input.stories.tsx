// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/HumanNameInput/HumanNameInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { HumanNameInput } from '@/components/medplum/human-name-input';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import { buildElementsContext } from '@medplum/core';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/HumanNameInput',
  component: HumanNameInput,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <HumanNameInput
      name="patient-name"
      path="Patient.name"
      defaultValue={{ prefix: ['Mr.'], given: ['Homer', 'J.'], family: 'Simpson' }}
      onChange={console.log}
      outcome={undefined}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <HumanNameInput
      disabled
      name="patient-name"
      path="Patient.name"
      defaultValue={{ prefix: ['Mr.'], given: ['Homer', 'J.'], family: 'Simpson' }}
      onChange={console.log}
      outcome={undefined}
    />
  </Document>
);

export const PartiallyDisabled = (): JSX.Element => {
  const context = buildElementsContext({
    parentContext: undefined,
    path: 'Patient',
    elements: {},
    accessPolicyResource: {
      resourceType: 'Patient',
      readonlyFields: ['name.use', 'name.given', 'name.suffix'],
    },
  });
  if (!context) {
    return <div>Context unexpectedly undefined</div>;
  }

  return maybeWrapWithContext(
    ElementsContext.Provider,
    context,
    <Document>
      <HumanNameInput
        name="patient-name"
        path="Patient.name"
        defaultValue={{ prefix: ['Mr.'], given: ['Homer', 'J.'], family: 'Simpson' }}
        onChange={console.log}
        outcome={undefined}
      />
    </Document>
  );
};
