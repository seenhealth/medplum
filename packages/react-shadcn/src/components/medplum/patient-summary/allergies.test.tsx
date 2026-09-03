// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Allergies.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Allergies } from '@/components/medplum/patient-summary/allergies';
import { act, fireEvent, render, screen, selectAutocompleteOption } from '@/test/render';
import { createReference } from '@medplum/core';
import type { AllergyIntolerance } from '@medplum/fhirtypes';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import type { ReactNode } from 'react';

const medplum = new MockClient();

describe('PatientSummary - Allergies', () => {
  async function setup(children: ReactNode): Promise<void> {
    await act(async () => {
      render(<MedplumProvider medplum={medplum}>{children}</MedplumProvider>);
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  test('Renders empty', async () => {
    await setup(<Allergies patient={HomerSimpson} allergies={[]} />);
    expect(screen.getByText('Allergies')).toBeInTheDocument();
  });

  test('Renders existing', async () => {
    await setup(
      <Allergies
        patient={HomerSimpson}
        allergies={[
          {
            resourceType: 'AllergyIntolerance',
            id: 'peanut',
            patient: { reference: 'Patient/123' },
            code: { text: 'Peanut' },
          },
        ]}
      />
    );
    expect(screen.getByText('Allergies')).toBeInTheDocument();
    expect(screen.getByText('Peanut')).toBeInTheDocument();
  });

  test('Add allergy', async () => {
    await setup(<Allergies patient={HomerSimpson} allergies={[]} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Add item'));
    });

    const input = (await screen.findAllByRole('searchbox'))[0] as HTMLInputElement;
    await selectAutocompleteOption(input, 'Test', 'Test Display');

    expect(screen.getByText('Test Display')).toBeDefined();

    // Click "Save" button
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
  });

  test('Edit allergy', async () => {
    const allergy: AllergyIntolerance = {
      resourceType: 'AllergyIntolerance',
      id: 'peanut',
      patient: createReference(HomerSimpson),
      code: { text: 'Peanut' },
    };

    await setup(<Allergies patient={HomerSimpson} allergies={[allergy]} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Peanut'));
    });

    const input = (await screen.findAllByRole('searchbox'))[0] as HTMLInputElement;
    await selectAutocompleteOption(input, 'Test', 'Test Display');

    expect(screen.getByText('Test Display')).toBeDefined();

    // Click "Save" button
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
  });

  test('Allergy status colors', async () => {
    await setup(
      <Allergies
        patient={HomerSimpson}
        allergies={[
          {
            resourceType: 'AllergyIntolerance',
            id: 'active',
            patient: createReference(HomerSimpson),
            code: { text: 'Active Allergy' },
            clinicalStatus: {
              coding: [
                {
                  code: 'active',
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                  display: 'Active',
                },
              ],
            },
          },
          {
            resourceType: 'AllergyIntolerance',
            id: 'inactive',
            patient: createReference(HomerSimpson),
            code: { text: 'Inactive Allergy' },
            clinicalStatus: {
              coding: [
                {
                  code: 'inactive',
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                  display: 'Inactive',
                },
              ],
            },
          },
          {
            resourceType: 'AllergyIntolerance',
            id: 'resolved',
            patient: createReference(HomerSimpson),
            code: { text: 'Resolved Allergy' },
            clinicalStatus: {
              coding: [
                {
                  code: 'resolved',
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                  display: 'Resolved',
                },
              ],
            },
          },
          {
            resourceType: 'AllergyIntolerance',
            id: 'unknown',
            patient: createReference(HomerSimpson),
            code: { text: 'Unknown Allergy' },
            clinicalStatus: {
              coding: [
                {
                  code: 'unknown',
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                  display: 'Unknown',
                },
              ],
            },
          },
        ]}
      />
    );

    const activeBadge = screen.getByText('active').closest('[data-slot="badge"]');
    expect(activeBadge).toBeInTheDocument();

    const inactiveBadge = screen.getByText('inactive').closest('[data-slot="badge"]');
    expect(inactiveBadge).toBeInTheDocument();

    const resolvedBadge = screen.getByText('resolved').closest('[data-slot="badge"]');
    expect(resolvedBadge).toBeInTheDocument();

    const unknownBadge = screen.getByText('unknown').closest('[data-slot="badge"]');
    expect(unknownBadge).toBeInTheDocument();
  });
});
