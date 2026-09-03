// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/MedicationDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptInput } from '@/components/medplum/codeable-concept-input';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HTTP_HL7_ORG, addProfileToResource, createReference } from '@medplum/core';
import type { Encounter, MedicationRequest, Patient } from '@medplum/fhirtypes';
import { useMedplumProfile } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface MedicationDialogProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly medication?: MedicationRequest;
  readonly onSubmit: (medication: MedicationRequest) => void;
}

const HTTP = 'http://';

const statusValues: MedicationRequest['status'][] = [
  'active',
  'stopped',
  'on-hold',
  'cancelled',
  'completed',
  'entered-in-error',
  'draft',
  'unknown',
];

export function MedicationDialog(props: MedicationDialogProps): JSX.Element {
  const me = useMedplumProfile();
  const { patient, encounter, medication, onSubmit } = props;
  const [code, setCode] = useState(medication?.medicationCodeableConcept);
  const [status, setStatus] = useState(medication?.status);

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      if (!me) {
        throw new Error('Not signed in');
      }

      onSubmit(
        addProfileToResource(
          {
            ...medication,
            resourceType: 'MedicationRequest',
            status: formData.status as MedicationRequest['status'],
            intent: medication?.intent ?? 'order',
            encounter: medication?.encounter ?? (encounter && createReference(encounter)),
            requester: medication?.requester ?? createReference(me),
            medicationCodeableConcept: code,
            subject: createReference(patient),
          },
          HTTP_HL7_ORG + '/fhir/us/core/StructureDefinition/us-core-medicationrequest'
        )
      );
    },
    [me, onSubmit, medication, encounter, code, patient]
  );

  if (!me) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Not signed in</AlertDescription>
      </Alert>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <CodeableConceptInput
          name="request"
          path="MedicationRequest.medication[x]"
          data-autofocus={true}
          binding={HTTP + 'cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1010.4'}
          maxValues={1}
          defaultValue={medication?.medicationCodeableConcept}
          onChange={(request) => setCode(request)}
          outcome={undefined}
        />
        <div className="flex flex-col gap-2">
          <Label>
            Request Status <span className="text-destructive">*</span>
          </Label>
          <RadioGroup name="status" value={status} onValueChange={(value) => setStatus(value as typeof status)}>
            {statusValues.map((sv) => (
              <div key={sv} className="my-2 flex items-center gap-2">
                <RadioGroupItem value={sv} id={`medication-status-${sv}`} />
                <Label htmlFor={`medication-status-${sv}`}>{sv}</Label>
              </div>
            ))}
          </RadioGroup>
          {status && <input type="hidden" name="status" value={status} />}
        </div>
        <div className="flex justify-end gap-1">
          <SubmitButton>Save</SubmitButton>
        </div>
      </div>
    </Form>
  );
}
