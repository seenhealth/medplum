// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/PatientSummary.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { PatientSummarySectionConfig } from '@/components/medplum/patient-summary/patient-summary-types';
import { getDefaultSections } from '@/components/medplum/patient-summary/section-configs';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { ResourceAvatar } from '@/components/medplum/resource-avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatHumanName, resolveId } from '@medplum/core';
import type { Patient, Reference, Resource } from '@medplum/fhirtypes';
import { useMedplum, usePatientSummaryData, useResource } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';

export interface PatientSummaryProps {
  readonly patient: Patient | Reference<Patient>;
  readonly onClickResource?: (resource: Resource) => void;
  readonly onRequestLabs?: () => void;
  readonly sections?: PatientSummarySectionConfig[];
}

export function PatientSummary(props: PatientSummaryProps): JSX.Element | null {
  const medplum = useMedplum();
  const { patient: propsPatient, onClickResource, onRequestLabs } = props;
  const patient = useResource(propsPatient);
  const [createdDate, setCreatedDate] = useState<string | undefined>();

  // Determine sections: custom or default
  const defaultSections = useMemo(() => getDefaultSections(onRequestLabs), [onRequestLabs]);
  const sections = props.sections ?? defaultSections;

  // Fetch all data for all sections (with search deduplication)
  const { sectionData, loading, error } = usePatientSummaryData(propsPatient, sections);

  useEffect(() => {
    const id = resolveId(propsPatient);
    if (id) {
      medplum
        .readHistory('Patient', id)
        .then((history) => {
          const firstEntry = history.entry?.[history.entry.length - 1];
          const lastUpdated = firstEntry?.resource?.meta?.lastUpdated;
          setCreatedDate(typeof lastUpdated === 'string' ? lastUpdated : '');
        })
        .catch(() => {});
    }
  }, [propsPatient, medplum]);

  if (!patient) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 bg-white dark:bg-zinc-950">
      <SummaryItem
        onClick={() => {
          onClickResource?.(patient);
        }}
      >
        <div className="flex items-center gap-3 p-4">
          <ResourceAvatar value={patient} className="size-12 rounded-full border-2 border-white" />
          <div className="min-w-0 flex-1">
            <Tooltip delayDuration={650}>
              <TooltipTrigger asChild>
                <p className="min-w-0 truncate text-xl font-extrabold">{formatHumanName(patient.name?.[0])}</p>
              </TooltipTrigger>
              <TooltipContent side="top" align="start">
                {formatHumanName(patient.name?.[0])}
              </TooltipContent>
            </Tooltip>
            {(() => {
              const dateString = typeof createdDate === 'string' && createdDate.length > 0 ? createdDate : undefined;
              if (!dateString) {
                return null;
              }
              const d = new Date(dateString);
              return (
                <p className="-mt-0.5 min-w-0 truncate text-xs font-medium text-muted-foreground">
                  Patient since {d.getMonth() + 1}/{d.getDate()}/{d.getFullYear()}
                </p>
              );
            })()}
          </div>
        </div>
        <Separator />
      </SummaryItem>

      <div className="min-h-0 flex-[2] overflow-y-auto px-4 pt-3 pb-4">
        <div className="flex flex-col gap-2">
          {error && <p className="text-sm text-destructive">Error loading patient summary: {error.message}</p>}
          {!loading && sections.length > 0 && (
            <>
              {sections.map((section, index) => {
                const SectionComponent = section.component;
                return (
                  <div key={section.key}>
                    <SectionComponent
                      patient={patient}
                      onClickResource={onClickResource}
                      results={sectionData[index] ?? {}}
                    />
                    <Separator />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
