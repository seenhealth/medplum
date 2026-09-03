// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceInput/ResourceInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceInput } from '@/components/medplum/resource-input';
import { createReference } from '@medplum/core';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceInput',
  component: ResourceInput,
} as Meta;

export const Practitioners = (): JSX.Element => (
  <Document>
    <ResourceInput name="foo" resourceType="Practitioner" />
  </Document>
);

export const Patients = (): JSX.Element => (
  <Document>
    <ResourceInput name="foo" resourceType="Patient" defaultValue={createReference(HomerSimpson)} />
  </Document>
);

export const Disabled = (): JSX.Element => (
  <Document>
    <ResourceInput disabled name="foo" resourceType="Patient" defaultValue={createReference(HomerSimpson)} />
  </Document>
);

export const Error = (): JSX.Element => (
  <Document>
    <ResourceInput
      name="foo"
      resourceType="Patient"
      defaultValue={createReference(HomerSimpson)}
      error="Something went wrong"
    />
  </Document>
);

export const Label = (): JSX.Element => (
  <Document>
    <ResourceInput name="foo" resourceType="Patient" defaultValue={createReference(HomerSimpson)} label="Patient" />
  </Document>
);
