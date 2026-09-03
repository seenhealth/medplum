// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/FormSection/FormSection.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { FormSection, FormSectionDescription, FormSectionLabel } from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { HumanNameInput } from '@/components/medplum/human-name-input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/FormSection',
  component: FormSection,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <Form onSubmit={console.log}>
      <div className="flex flex-col gap-4">
        <FormSection>
          <FormSectionLabel>Demographics</FormSectionLabel>
          <FormSectionDescription>{'Basic Patient Information\n      '}</FormSectionDescription>
          <HumanNameInput
            name="patient-name"
            path="Patient.name"
            defaultValue={{ given: ['Homer'], family: 'Simpson' }}
            onChange={undefined}
            outcome={undefined}
          />
          <NativeSelect name="gender" defaultValue="Male">
            <NativeSelectOption value="Male">Male</NativeSelectOption>
            <NativeSelectOption value="Female">Female</NativeSelectOption>
            <NativeSelectOption value="Other">Other</NativeSelectOption>
          </NativeSelect>
        </FormSection>

        <FormSection>
          <FormSectionLabel>Symptoms</FormSectionLabel>
          <FormSectionDescription>Description of patient symptoms</FormSectionDescription>
          <NativeSelect name="symptoms" defaultValue="Sore Throat">
            <NativeSelectOption value="Sore Throat">Sore Throat</NativeSelectOption>
            <NativeSelectOption value="Coughing">Coughing</NativeSelectOption>
            <NativeSelectOption value="Fever">Fever</NativeSelectOption>
            <NativeSelectOption value="Rash">Rash</NativeSelectOption>
          </NativeSelect>
        </FormSection>
      </div>
      <SubmitButton className="mt-3">Submit</SubmitButton>
    </Form>
  </Document>
);

export const Readonly = (): JSX.Element => (
  <Document>
    <FormSection readonly>
      <FormSectionLabel>Demographics</FormSectionLabel>
      <FormSectionDescription>{'Basic Patient Information\n      '}</FormSectionDescription>
      <HumanNameInput
        disabled
        name="patient-name"
        path="Patient.name"
        defaultValue={{ given: ['Homer'], family: 'Simpson' }}
        onChange={undefined}
        outcome={undefined}
      />
    </FormSection>
  </Document>
);
