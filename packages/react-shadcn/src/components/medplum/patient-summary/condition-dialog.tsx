// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/ConditionDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptInput } from '@/components/medplum/codeable-concept-input';
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { convertLocalToIso } from '@/components/medplum/date-time-input-utils';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { HTTP_HL7_ORG, HTTP_TERMINOLOGY_HL7_ORG, addProfileToResource, createReference } from '@medplum/core';
import type { Condition, Encounter, Patient } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface ConditionDialogProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly condition?: Condition;
  readonly onSubmit: (condition: Condition) => void;
}

export function ConditionDialog(props: ConditionDialogProps): JSX.Element {
  const { patient, encounter, condition, onSubmit } = props;
  const [code, setCode] = useState(condition?.code);
  const [clinicalStatus, setClinicalStatus] = useState(condition?.clinicalStatus);

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      const updatedCondition: Condition = addProfileToResource(
        {
          ...condition,
          resourceType: 'Condition',
          category: [
            {
              coding: [
                {
                  system: HTTP_TERMINOLOGY_HL7_ORG + '/CodeSystem/condition-category',
                  code: 'problem-list-item',
                  display: 'Problem List Item',
                },
              ],
              text: 'Problem List Item',
            },
          ],
          subject: createReference(patient),
          encounter: encounter && createReference(encounter),
          code,
          clinicalStatus,
          onsetDateTime: formData.onsetDateTime ? convertLocalToIso(formData.onsetDateTime) : undefined,
        },
        HTTP_HL7_ORG + '/fhir/us/core/StructureDefinition/us-core-condition-problems-health-concerns'
      );
      onSubmit(updatedCondition);
    },
    [patient, encounter, condition, code, clinicalStatus, onSubmit]
  );

  return (
    <Form key={condition?.id} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <CodeableConceptInput
          name="code"
          label="Problem"
          path="Condition.code"
          data-autofocus={true}
          binding={HTTP_HL7_ORG + '/fhir/us/core/ValueSet/us-core-condition-code'}
          defaultValue={condition?.code}
          onChange={(code) => setCode(code)}
          outcome={undefined}
        />
        <CodeableConceptInput
          name="clinicalStatus"
          label="Status"
          path="Condition.clinicalStatus"
          binding={HTTP_HL7_ORG + '/fhir/ValueSet/condition-clinical'}
          defaultValue={condition?.clinicalStatus}
          onChange={(clinicalStatus) => setClinicalStatus(clinicalStatus)}
          outcome={undefined}
        />
        <DateTimeInput name="onsetDateTime" label="Dx Date *" defaultValue={condition?.onsetDateTime} required />
        <div className="mt-4 flex justify-end gap-1">
          <SubmitButton>Save</SubmitButton>
        </div>
      </div>
    </Form>
  );
}
