// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Medications.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Modal, ModalBody, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { MedicationDialog } from '@/components/medplum/patient-summary/medication-dialog';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { compareByLastUpdatedDescending } from '@/lib/medplum/date';
import { formatCodeableConcept, getDisplayString } from '@medplum/core';
import type { Encounter, MedicationRequest, MedicationStatement, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export type MedicationSummaryResource = MedicationRequest | MedicationStatement;

export interface MedicationsProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly medicationRequests: MedicationRequest[];
  readonly medicationStatements?: MedicationStatement[];
  readonly onClickResource?: (resource: MedicationSummaryResource) => void;
}

export function Medications(props: MedicationsProps): JSX.Element {
  const medplum = useMedplum();
  const [medicationRequests, setMedicationRequests] = useState(props.medicationRequests);
  const [editMedication, setEditMedication] = useState<MedicationRequest>();
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const medications = [...medicationRequests, ...(props.medicationStatements ?? [])].sort(
    compareByLastUpdatedDescending
  );

  const handleSubmit = useCallback(
    async (medication: MedicationRequest) => {
      if (medication.id) {
        const updatedMedication = await medplum.updateResource(medication);
        setMedicationRequests(medicationRequests.map((m) => (m.id === updatedMedication.id ? updatedMedication : m)));
      } else {
        const newMedication = await medplum.createResource(medication);
        setMedicationRequests([newMedication, ...medicationRequests]);
      }

      setEditMedication(undefined);
      close();
    },
    [medplum, medicationRequests, close]
  );

  return (
    <>
      <CollapsibleSection
        title="Medications"
        onAdd={() => {
          setEditMedication(undefined);
          open();
        }}
      >
        {medications.length > 0 ? (
          <div className="flex flex-col gap-2">
            {medications.map((medication) => (
              <SummaryItem
                key={`${medication.resourceType}/${medication.id}`}
                onClick={() => {
                  if (medication.resourceType === 'MedicationRequest') {
                    setEditMedication(medication);
                    open();
                  } else {
                    props.onClickResource?.(medication);
                  }
                }}
              >
                <div>
                  <p className="truncate overflow-hidden font-medium whitespace-nowrap">
                    {getMedicationDisplayString(medication)}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {medication.status && <StatusBadge status={medication.status} />}
                  </div>
                </div>
              </SummaryItem>
            ))}
          </div>
        ) : (
          <p>(none)</p>
        )}
      </CollapsibleSection>
      <Modal open={opened} onOpenChange={(next) => !next && close()}>
        <ModalHeader>
          <ModalTitle>{editMedication ? 'Edit Medication' : 'Add Medication'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <MedicationDialog
            patient={props.patient}
            encounter={props.encounter}
            medication={editMedication}
            onSubmit={handleSubmit}
          />
        </ModalBody>
      </Modal>
    </>
  );
}

function getMedicationDisplayString(medication: MedicationSummaryResource): string {
  if (medication.medicationCodeableConcept) {
    return formatCodeableConcept(medication.medicationCodeableConcept);
  }

  return getDisplayString(medication);
}
