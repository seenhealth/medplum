// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Form/Form.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { HumanNameInput } from '@/components/medplum/human-name-input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/Form',
  component: Form,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <Form onSubmit={console.log}>
      <div className="flex flex-col gap-4">
        <HumanNameInput
          name="patient-name"
          path="name"
          onChange={undefined}
          outcome={undefined}
          defaultValue={{ given: ['Homer'], family: 'Simpson' }}
        />
        <NativeSelect name="appointment-type" defaultValue="Sick">
          <NativeSelectOption value="Sick">Sick</NativeSelectOption>
          <NativeSelectOption value="Well">Well</NativeSelectOption>
        </NativeSelect>
        <SubmitButton className="mt-3">Submit</SubmitButton>
      </div>
    </Form>
  </Document>
);
