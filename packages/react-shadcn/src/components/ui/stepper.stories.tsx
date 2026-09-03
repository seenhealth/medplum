// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Document } from '@/components/medplum/document';
import { Stepper, StepperContent, StepperStep } from '@/components/ui/stepper';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'UI/Stepper',
  component: Stepper,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <Stepper active={1} allowNextStepsSelect={false}>
      <StepperStep label="Patient info" description="Basic details" />
      <StepperStep label="Insurance" description="Coverage details" />
      <StepperStep label="Review" description="Confirm and submit" />
    </Stepper>
    <StepperContent>Step content goes here.</StepperContent>
  </Document>
);
