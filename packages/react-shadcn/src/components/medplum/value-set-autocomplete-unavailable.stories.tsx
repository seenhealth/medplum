// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ValueSetAutocomplete/ValueSetAutocomplete.unavailable.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ValueSetAutocomplete } from '@/components/medplum/value-set-autocomplete';
import { badRequest, OperationOutcomeError } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ValueSetAutocomplete',
  component: ValueSetAutocomplete,
} as Meta;

// A client whose probe rejects for any URL containing "missing" (a permanent 400), so the
// availability probe marks the field unavailable. Everything else resolves normally.
function makeClient(): MockClient {
  const medplum = new MockClient();
  const originalExpand = medplum.valueSetExpand.bind(medplum);
  medplum.valueSetExpand = (async (
    params: Parameters<typeof originalExpand>[0],
    options?: Parameters<typeof originalExpand>[1]
  ) => {
    if (params.url?.includes('missing')) {
      throw new OperationOutcomeError(badRequest(`ValueSet ${params.url} not found`));
    }
    return originalExpand(params, options);
  }) as typeof medplum.valueSetExpand;
  return medplum;
}

const MISSING = 'http://example.com/missing';

function Field({ label, children }: { label: string; children: JSX.Element }): JSX.Element {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

export const Unavailable = (): JSX.Element => (
  <MedplumProvider medplum={makeClient()}>
    <Document>
      <div className="flex max-w-[420px] flex-col gap-8">
        <Field label="1. Creatable + unavailable (still usable; yellow note in description)">
          <ValueSetAutocomplete binding={MISSING} onChange={console.log} placeholder="Type a value" />
        </Field>

        <Field label="2. Non-creatable + unavailable (disabled; red note in error slot)">
          <ValueSetAutocomplete binding={MISSING} creatable={false} onChange={console.log} placeholder="Type a value" />
        </Field>

        <Field label="3. Non-creatable + unavailable + a consumer validation error (both shown)">
          <ValueSetAutocomplete
            binding={MISSING}
            creatable={false}
            error="Required field"
            onChange={console.log}
            placeholder="Type a value"
          />
        </Field>

        <Field label="4. Available value set, for reference (normal behavior)">
          <ValueSetAutocomplete binding="x" onChange={console.log} placeholder="Type a value" />
        </Field>
      </div>
    </Document>
  </MedplumProvider>
);
