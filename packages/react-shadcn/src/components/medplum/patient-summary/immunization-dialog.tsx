// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/ImmunizationDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptInput } from '@/components/medplum/codeable-concept-input';
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { convertLocalToIso } from '@/components/medplum/date-time-input-utils';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { formatStatusLabel } from '@/components/medplum/patient-summary/patient-summary-utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createReference } from '@medplum/core';
import type { Encounter, Immunization, Patient } from '@medplum/fhirtypes';
import { IconTrash } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface ImmunizationDialogProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly immunization?: Immunization;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (immunization: Immunization) => void;
  /** When editing an existing immunization, called to delete it. */
  readonly onDelete?: () => void;
}

const statusValues: Immunization['status'][] = ['completed', 'not-done'];

export function ImmunizationDialog(props: ImmunizationDialogProps): JSX.Element {
  const { patient, encounter, immunization, opened, onClose, onSubmit, onDelete } = props;
  const [vaccineCode, setVaccineCode] = useState(immunization?.vaccineCode);
  const [status, setStatus] = useState<string>(immunization?.status ?? 'completed');

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      onSubmit({
        ...immunization,
        resourceType: 'Immunization',
        status: (formData.status as Immunization['status']) ?? 'completed',
        patient: createReference(patient),
        encounter: immunization?.encounter ?? (encounter && createReference(encounter)),
        vaccineCode: vaccineCode ?? { text: '' },
        occurrenceDateTime: formData.occurrenceDateTime
          ? convertLocalToIso(formData.occurrenceDateTime)
          : (immunization?.occurrenceDateTime ?? ''),
      });
    },
    [patient, encounter, immunization, vaccineCode, onSubmit]
  );

  return (
    <Modal open={opened} onOpenChange={(next) => !next && onClose()} size="md">
      <ModalHeader>
        <ModalTitle>{immunization ? 'Edit Immunization' : 'Add Immunization'}</ModalTitle>
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <CodeableConceptInput
              name="vaccineCode"
              label="Vaccine"
              path="Immunization.vaccineCode"
              data-autofocus={true}
              binding="http://hl7.org/fhir/ValueSet/vaccine-code"
              maxValues={1}
              defaultValue={immunization?.vaccineCode}
              onChange={(value) => setVaccineCode(value)}
              outcome={undefined}
            />
            <DateTimeInput
              name="occurrenceDateTime"
              label="Date Given"
              defaultValue={immunization?.occurrenceDateTime}
              required
            />
            <div className="flex flex-col gap-2">
              <Label>
                Status <span className="text-destructive">*</span>
              </Label>
              <RadioGroup name="status" value={status} onValueChange={setStatus}>
                {statusValues.map((sv) => (
                  <div key={sv} className="my-2 flex items-center gap-2">
                    <RadioGroupItem value={sv} id={`immunization-status-${sv}`} />
                    <Label htmlFor={`immunization-status-${sv}`}>{formatStatusLabel(sv as string)}</Label>
                  </div>
                ))}
              </RadioGroup>
              <input type="hidden" name="status" value={status} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <SubmitButton>Save</SubmitButton>
          {immunization?.id && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              <IconTrash size={16} />
              Delete
            </Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
}
