// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/AllergyDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptInput } from '@/components/medplum/codeable-concept-input';
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Input } from '@/components/ui/input';
import { HTTP_HL7_ORG, addProfileToResource, createReference } from '@medplum/core';
import type { AllergyIntolerance, Encounter, Patient } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface AllergyDialogProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly allergy?: AllergyIntolerance;
  readonly onSubmit: (allergy: AllergyIntolerance) => void;
}

const HTTP = 'http://';

const PATIENT_ALLERGY_PROFILE = HTTP_HL7_ORG + '/fhir/us/core/StructureDefinition/us-core-allergyintolerance';

export function AllergyDialog(props: AllergyDialogProps): JSX.Element {
  const { patient, encounter, allergy, onSubmit } = props;
  const [code, setCode] = useState(allergy?.code);
  const [clinicalStatus, setClinicalStatus] = useState(allergy?.clinicalStatus);

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      onSubmit(
        addProfileToResource(
          {
            ...allergy,
            resourceType: 'AllergyIntolerance',
            patient: createReference(patient),
            encounter: encounter ? createReference(encounter) : undefined,
            code,
            clinicalStatus,
            onsetDateTime: formData.onsetDateTime ? formData.onsetDateTime : undefined,
            reaction: formData.reaction ? [{ manifestation: [{ text: formData.reaction }] }] : undefined,
          },
          PATIENT_ALLERGY_PROFILE
        )
      );
    },
    [patient, encounter, allergy, code, clinicalStatus, onSubmit]
  );

  return (
    <Form key={allergy?.id} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <CodeableConceptInput
          name="allergy"
          label="Code"
          path="AllergyIntolerance.code"
          data-autofocus={true}
          binding={HTTP + 'cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1186.8'}
          maxValues={1}
          defaultValue={allergy?.code}
          onChange={(code) => setCode(code)}
          outcome={undefined}
        />
        <FormSection htmlFor="reaction">
          <FormSectionLabel>Reaction</FormSectionLabel>
          <Input id="reaction" name="reaction" defaultValue={allergy?.reaction?.[0]?.manifestation?.[0]?.text} />
        </FormSection>
        <CodeableConceptInput
          name="clinicalStatus"
          label="Clinical Status"
          path="AllergyIntolerance.clinicalStatus"
          binding={HTTP_HL7_ORG + '/fhir/ValueSet/allergyintolerance-clinical'}
          maxValues={1}
          defaultValue={allergy?.clinicalStatus}
          onChange={(clinicalStatus) => setClinicalStatus(clinicalStatus)}
          outcome={undefined}
        />
        <DateTimeInput name="onsetDateTime" label="Onset" defaultValue={allergy?.recordedDate} />
        <div className="mt-4 flex justify-end gap-1">
          <SubmitButton>Save</SubmitButton>
        </div>
      </div>
    </Form>
  );
}
