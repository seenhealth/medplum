// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientHeader/PatientHeader.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { HumanNameDisplay } from '@/components/medplum/human-name-display';
import { InfoBar } from '@/components/medplum/info-bar';
import { MedplumLink } from '@/components/medplum/medplum-link';
import { getDefaultColor } from '@/components/medplum/patient-header-utils';
import { ResourceAvatar } from '@/components/medplum/resource-avatar';
import { calculateAgeString } from '@medplum/core';
import type { Patient, Reference } from '@medplum/fhirtypes';
import { useResource } from '@medplum/react-hooks';
import type { JSX } from 'react';

export interface PatientHeaderProps {
  readonly patient: Patient | Reference<Patient>;
}

export function PatientHeader(props: PatientHeaderProps): JSX.Element | null {
  const patient = useResource(props.patient);
  if (!patient) {
    return null;
  }
  const genderColor = getDefaultColor(patient);
  let avatarTint: string | undefined;
  if (genderColor === 'blue') {
    avatarTint = 'bg-blue-100 text-blue-800';
  } else if (genderColor === 'pink') {
    avatarTint = 'bg-pink-100 text-pink-800';
  }
  return (
    <InfoBar>
      <ResourceAvatar value={patient} size="lg" className={avatarTint} />
      <InfoBar.Entry>
        <InfoBar.Key>Name</InfoBar.Key>
        <InfoBar.Value>
          <MedplumLink to={patient} className="font-medium">
            {patient.name ? <HumanNameDisplay value={patient.name[0]} options={{ use: false }} /> : '[blank]'}
          </MedplumLink>
        </InfoBar.Value>
      </InfoBar.Entry>
      {patient.birthDate && (
        <>
          <InfoBar.Entry>
            <InfoBar.Key>DoB</InfoBar.Key>
            <InfoBar.Value>{patient.birthDate}</InfoBar.Value>
          </InfoBar.Entry>
          <InfoBar.Entry>
            <InfoBar.Key>Age</InfoBar.Key>
            <InfoBar.Value>{calculateAgeString(patient.birthDate)}</InfoBar.Value>
          </InfoBar.Entry>
        </>
      )}
      {patient.gender && (
        <InfoBar.Entry>
          <InfoBar.Key>Gender</InfoBar.Key>
          <InfoBar.Value>{patient.gender}</InfoBar.Value>
        </InfoBar.Entry>
      )}
      {patient.address && (
        <InfoBar.Entry>
          <InfoBar.Key>State</InfoBar.Key>
          <InfoBar.Value>{patient.address[0]?.state}</InfoBar.Value>
        </InfoBar.Entry>
      )}
      {patient.identifier?.map((identifier) => (
        <InfoBar.Entry key={`${identifier?.system}-${identifier?.value}`}>
          <InfoBar.Key>{identifier?.system}</InfoBar.Key>
          <InfoBar.Value>{identifier?.value}</InfoBar.Value>
        </InfoBar.Entry>
      ))}
    </InfoBar>
  );
}
