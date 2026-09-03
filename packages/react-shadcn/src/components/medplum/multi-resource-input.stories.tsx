// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceInput/MultiResourceInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { MultiResourceInput } from '@/components/medplum/multi-resource-input';
import { createReference } from '@medplum/core';
import { BartSimpson, HomerSimpson, LisaSimpson, MargeSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/MultiResourceInput',
  component: MultiResourceInput,
} as Meta;

export const Empty = (): JSX.Element => (
  <Document>
    <MultiResourceInput name="foo" resourceType="Patient" placeholder="Search patients..." />
  </Document>
);

export const WithDefaultResources = (): JSX.Element => (
  <Document>
    <MultiResourceInput name="foo" resourceType="Patient" defaultValue={[HomerSimpson, MargeSimpson]} />
  </Document>
);

export const WithDefaultReferences = (): JSX.Element => (
  <Document>
    <MultiResourceInput
      name="foo"
      resourceType="Patient"
      defaultValue={[createReference(HomerSimpson), createReference(MargeSimpson)]}
    />
  </Document>
);

export const ManyDefaults = (): JSX.Element => (
  <Document>
    <MultiResourceInput
      name="foo"
      resourceType="Patient"
      defaultValue={[HomerSimpson, MargeSimpson, LisaSimpson, BartSimpson]}
    />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <MultiResourceInput disabled name="foo" resourceType="Patient" defaultValue={[HomerSimpson, MargeSimpson]} />
  </Document>
);

export const WithMaxValues = (): JSX.Element => (
  <Document>
    <MultiResourceInput
      name="foo"
      resourceType="Patient"
      defaultValue={[HomerSimpson]}
      maxValues={3}
      placeholder="Select up to 3 patients..."
    />
  </Document>
);

export const WithLabel = (): JSX.Element => (
  <Document>
    <MultiResourceInput
      name="foo"
      resourceType="Patient"
      defaultValue={[HomerSimpson, MargeSimpson]}
      label="Patients"
    />
  </Document>
);

export const WithError = (): JSX.Element => (
  <Document>
    <MultiResourceInput
      name="foo"
      resourceType="Patient"
      defaultValue={[HomerSimpson]}
      error="At least two patients must be selected"
    />
  </Document>
);

export const Practitioners = (): JSX.Element => (
  <Document>
    <MultiResourceInput
      name="foo"
      resourceType="Practitioner"
      label="Care team members"
      placeholder="Search practitioners..."
    />
  </Document>
);
