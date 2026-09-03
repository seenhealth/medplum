// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Medications.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Medications } from '@/components/medplum/patient-summary/medications';
import { act, fireEvent, render, screen, selectAutocompleteOption } from '@/test/render';
import { createReference } from '@medplum/core';
import type { MedicationRequest, MedicationStatement } from '@medplum/fhirtypes';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import type { ReactNode } from 'react';

const medplum = new MockClient();

describe('PatientSummary - Medications', () => {
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
    await setup(<Medications patient={HomerSimpson} medicationRequests={[]} />);
    expect(screen.getByText('Medications')).toBeInTheDocument();
  });

  test('Renders existing', async () => {
    await setup(
      <Medications
        patient={HomerSimpson}
        medicationRequests={[
          {
            resourceType: 'MedicationRequest',
            id: 'peanut',
            status: 'active',
            intent: 'order',
            subject: { reference: 'Patient/123' },
            medicationCodeableConcept: { text: 'Tylenol' },
          },
        ]}
      />
    );
    expect(screen.getByText('Medications')).toBeInTheDocument();
    expect(screen.getByText('Tylenol')).toBeInTheDocument();
  });

  test('Renders medication statements', async () => {
    await setup(
      <Medications
        patient={HomerSimpson}
        medicationRequests={[]}
        medicationStatements={[
          {
            resourceType: 'MedicationStatement',
            id: 'statement-1',
            status: 'active',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Atorvastatin' },
          },
        ]}
      />
    );

    expect(screen.getByText('Medications')).toBeInTheDocument();
    expect(screen.getByText('Atorvastatin')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  test('Medication statement click calls onClickResource', async () => {
    const onClickResource = vi.fn();
    const medicationStatement: MedicationStatement = {
      resourceType: 'MedicationStatement',
      id: 'statement-1',
      status: 'active',
      subject: createReference(HomerSimpson),
      medicationCodeableConcept: { text: 'Atorvastatin' },
    };

    await setup(
      <Medications
        patient={HomerSimpson}
        medicationRequests={[]}
        medicationStatements={[medicationStatement]}
        onClickResource={onClickResource}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Atorvastatin'));
    });

    expect(onClickResource).toHaveBeenCalledWith(medicationStatement);
    expect(screen.queryByText('Edit Medication')).not.toBeInTheDocument();
  });

  test('Add medication', async () => {
    await setup(<Medications patient={HomerSimpson} medicationRequests={[]} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Add item'));
    });

    const input = await screen.findByRole('searchbox');
    await selectAutocompleteOption(input, 'Test', 'Test Display');

    expect(screen.getByText('Test Display')).toBeDefined();

    // Click "Save" button
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
  });

  test('Edit medication', async () => {
    const medication: MedicationRequest = {
      resourceType: 'MedicationRequest',
      id: 'tylenol',
      status: 'active',
      intent: 'order',
      subject: createReference(HomerSimpson),
      medicationCodeableConcept: { text: 'Tylenol' },
    };

    await setup(<Medications patient={HomerSimpson} medicationRequests={[medication]} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Tylenol'));
    });

    const input = await screen.findByRole('searchbox');
    await selectAutocompleteOption(input, 'Test', 'Test Display');

    expect(screen.getByText('Test Display')).toBeDefined();

    // Click "Save" button
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
  });

  test('Medication status colors', async () => {
    await setup(
      <Medications
        patient={HomerSimpson}
        medicationRequests={[
          {
            resourceType: 'MedicationRequest',
            id: 'active',
            status: 'active',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Active Medication' },
          },
          {
            resourceType: 'MedicationRequest',
            id: 'on-hold',
            status: 'on-hold',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'On Hold Medication' },
          },
          {
            resourceType: 'MedicationRequest',
            id: 'cancelled',
            status: 'cancelled',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Cancelled Medication' },
          },
          {
            resourceType: 'MedicationRequest',
            id: 'completed',
            status: 'completed',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Completed Medication' },
          },
          {
            resourceType: 'MedicationRequest',
            id: 'entered-in-error',
            status: 'entered-in-error',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Error Medication' },
          },
          {
            resourceType: 'MedicationRequest',
            id: 'draft',
            status: 'draft',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Draft Medication' },
          },
          {
            resourceType: 'MedicationRequest',
            id: 'stopped',
            status: 'stopped',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Stopped Medication' },
          },
          {
            resourceType: 'MedicationRequest',
            id: 'unknown',
            status: 'unknown',
            intent: 'order',
            subject: createReference(HomerSimpson),
            medicationCodeableConcept: { text: 'Unknown Medication' },
          },
        ]}
      />
    );

    const activeBadge = screen.getByText('active').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(activeBadge).toBeInTheDocument();

    const onHoldBadge = screen.getByText('on hold').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(onHoldBadge).toBeInTheDocument();

    const cancelledBadge = screen.getByText('cancelled').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(cancelledBadge).toBeInTheDocument();

    const completedBadge = screen.getByText('completed').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(completedBadge).toBeInTheDocument();

    const errorBadge = screen.getByText('entered in error').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(errorBadge).toBeInTheDocument();

    const draftBadge = screen.getByText('draft').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(draftBadge).toBeInTheDocument();

    const stoppedBadge = screen.getByText('stopped').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(stoppedBadge).toBeInTheDocument();

    const unknownBadge = screen.getByText('unknown').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(unknownBadge).toBeInTheDocument();
  });
});
