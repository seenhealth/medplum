// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Immunizations.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { ImmunizationDialog } from '@/components/medplum/patient-summary/immunization-dialog';
import { isEnteredInError } from '@/components/medplum/patient-summary/patient-summary-utils';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { formatCodeableConcept, formatDate } from '@medplum/core';
import type { Encounter, Immunization, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface ImmunizationsProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly immunizations: Immunization[];
}

export function Immunizations(props: ImmunizationsProps): JSX.Element {
  const medplum = useMedplum();
  const { patient, encounter } = props;
  const [immunizations, setImmunizations] = useState(props.immunizations);
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const [editImmunization, setEditImmunization] = useState<Immunization>();

  // Hide entered-in-error immunizations (still reachable by direct URL); most recent first.
  const sortedImmunizations = [...immunizations]
    .filter((immunization) => !isEnteredInError(immunization))
    .sort((a, b) => (b.occurrenceDateTime ?? '').localeCompare(a.occurrenceDateTime ?? ''));

  const handleSubmit = useCallback(
    async (immunization: Immunization) => {
      if (immunization.id) {
        const updated = await medplum.updateResource(immunization);
        setImmunizations(immunizations.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await medplum.createResource(immunization);
        setImmunizations([created, ...immunizations]);
      }
      setEditImmunization(undefined);
      close();
    },
    [medplum, immunizations, close]
  );

  const handleDelete = useCallback(async () => {
    if (!editImmunization?.id) {
      return;
    }
    await medplum.deleteResource('Immunization', editImmunization.id);
    setImmunizations(immunizations.filter((i) => i.id !== editImmunization.id));
    setEditImmunization(undefined);
    close();
  }, [medplum, immunizations, editImmunization, close]);

  return (
    <>
      <CollapsibleSection
        title="Immunizations"
        onAdd={() => {
          setEditImmunization(undefined);
          open();
        }}
      >
        {sortedImmunizations.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sortedImmunizations.map((immunization) => (
              <SummaryItem
                key={immunization.id}
                onClick={() => {
                  setEditImmunization(immunization);
                  open();
                }}
              >
                <div>
                  <p className="truncate overflow-hidden font-medium whitespace-nowrap">
                    {getImmunizationDisplay(immunization)}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {immunization.status && <StatusBadge status={immunization.status} />}
                    {immunization.occurrenceDateTime && (
                      <p className="text-xs font-medium text-muted-foreground">
                        Given {formatDate(immunization.occurrenceDateTime)}
                      </p>
                    )}
                  </div>
                </div>
              </SummaryItem>
            ))}
          </div>
        ) : (
          <p>(none)</p>
        )}
      </CollapsibleSection>
      {/* Mounted only while open so every open is a fresh instance, with no leftover form state. */}
      {opened && (
        <ImmunizationDialog
          patient={patient}
          encounter={encounter}
          immunization={editImmunization}
          opened={opened}
          onClose={close}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

function getImmunizationDisplay(immunization: Immunization): string {
  return (immunization.vaccineCode && formatCodeableConcept(immunization.vaccineCode)) || 'Immunization';
}
