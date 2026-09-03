// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Allergies.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Modal, ModalBody, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { AllergyDialog } from '@/components/medplum/patient-summary/allergy-dialog';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { getDisplayString } from '@medplum/core';
import type { AllergyIntolerance, Encounter, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';

export interface AllergiesProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly allergies: AllergyIntolerance[];
  readonly onClickResource?: (resource: AllergyIntolerance) => void;
}

export function Allergies(props: AllergiesProps): JSX.Element {
  const medplum = useMedplum();
  const { patient, encounter } = props;
  const [allergies, setAllergies] = useState(props.allergies);
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const [editAllergy, setEditAllergy] = useState<AllergyIntolerance>();

  // Sort allergies with active ones first
  const sortedAllergies = useMemo(() => {
    return [...allergies].sort((a, b) => {
      const aStatus = a.clinicalStatus?.coding?.[0]?.code;
      const bStatus = b.clinicalStatus?.coding?.[0]?.code;

      // Active allergies first
      if (aStatus === 'active' && bStatus !== 'active') {
        return -1;
      }
      if (aStatus !== 'active' && bStatus === 'active') {
        return 1;
      }

      return getDisplayString(a).localeCompare(getDisplayString(b));
    });
  }, [allergies]);

  const handleSubmit = useCallback(
    async (allergy: AllergyIntolerance) => {
      if (allergy.id) {
        const updatedAllergy = await medplum.updateResource(allergy);
        setAllergies(allergies.map((a) => (a.id === updatedAllergy.id ? updatedAllergy : a)));
      } else {
        const newAllergy = await medplum.createResource(allergy);
        setAllergies([...allergies, newAllergy]);
      }
      setEditAllergy(undefined);
      close();
    },
    [medplum, allergies, close]
  );

  return (
    <>
      <CollapsibleSection
        title="Allergies"
        onAdd={() => {
          setEditAllergy(undefined);
          open();
        }}
      >
        {sortedAllergies.length > 0 ? (
          <div>
            <div className="flex flex-col gap-2">
              {sortedAllergies.map((allergy) => {
                const status = allergy.clinicalStatus?.coding?.[0]?.code || 'unknown';

                return (
                  <SummaryItem
                    key={allergy.id}
                    onClick={() => {
                      setEditAllergy(allergy);
                      open();
                    }}
                  >
                    <div>
                      <p className="truncate overflow-hidden font-medium whitespace-nowrap">
                        {getDisplayString(allergy)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1">{status && <StatusBadge status={status} />}</div>
                    </div>
                  </SummaryItem>
                );
              })}
            </div>
          </div>
        ) : (
          <p>(none)</p>
        )}
      </CollapsibleSection>
      <Modal open={opened} onOpenChange={(next) => !next && close()}>
        <ModalHeader>
          <ModalTitle>{editAllergy ? 'Edit Allergy' : 'Add Allergy'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <AllergyDialog patient={patient} encounter={encounter} allergy={editAllergy} onSubmit={handleSubmit} />
        </ModalBody>
      </Modal>
    </>
  );
}
