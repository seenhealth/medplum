// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CheckboxFormSection/CheckboxFormSection.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { FormSectionProps } from '@/components/medplum/form-section';
import { FormSection } from '@/components/medplum/form-section';
import type { JSX } from 'react';

export type CheckboxFormSectionProps = Omit<FormSectionProps, 'orientation'>;

// A FormSection laid out for a leading checkbox: put the control first, then
// <FormSectionContent><FormSectionLabel/><FormSectionDescription/></FormSectionContent>.
export function CheckboxFormSection(props: CheckboxFormSectionProps): JSX.Element {
  return <FormSection data-slot="checkbox-form-section" orientation="horizontal" {...props} />;
}
