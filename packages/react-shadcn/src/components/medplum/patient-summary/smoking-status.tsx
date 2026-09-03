// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/SmokingStatus.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HTTP_HL7_ORG, LOINC, SNOMED, createReference, formatCodeableConcept } from '@medplum/core';
import type { Encounter, Observation, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

// Smoking Status widget
// See: https://build.fhir.org/ig/HL7/US-Core/StructureDefinition-us-core-smokingstatus.html

const smokingStatusOptions: Record<string, string> = {
  '266919005': 'Never smoked tobacco',
  '266927001': 'Tobacco smoking consumption unknown',
  '428041000124106': 'Occasional tobacco smoker',
  '428061000124105': 'Light tobacco smoker',
  '428071000124103': 'Heavy tobacco smoker',
  '449868002': 'Smokes tobacco daily',
  '77176002': 'Smoker',
  '8517006': 'Ex-smoker',
};

export interface SmokingStatusProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly smokingStatus?: Observation;
  readonly onClickResource?: (resource: Observation) => void;
}

export function SmokingStatus(props: SmokingStatusProps): JSX.Element {
  const medplum = useMedplum();
  const [smokingStatus, setSmokingStatus] = useState(props.smokingStatus);
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const [statusCode, setStatusCode] = useState('');

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      medplum
        .createResource<Observation>({
          resourceType: 'Observation',
          meta: {
            profile: [HTTP_HL7_ORG + '/fhir/us/core/StructureDefinition/us-core-smokingstatus'],
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'social-history',
                  display: 'Social History',
                },
              ],
              text: 'Social History',
            },
          ],
          code: {
            coding: [
              {
                system: LOINC,
                code: '72166-2',
                display: 'Tobacco smoking status',
              },
            ],
            text: 'Tobacco smoking status',
          },
          subject: createReference(props.patient),
          encounter: props.encounter ? createReference(props.encounter) : undefined,
          effectiveDateTime: new Date().toISOString(),
          valueCodeableConcept: {
            coding: [
              {
                system: SNOMED,
                version: SNOMED + '/731000124108',
                code: formData.smokingStatus,
              },
            ],
            text: smokingStatusOptions[formData.smokingStatus],
          },
        })
        .then((newSmokingStatus) => {
          setSmokingStatus(newSmokingStatus);
          close();
        })
        .catch(console.error);
    },
    [medplum, props.patient, props.encounter, close]
  );

  return (
    <>
      <CollapsibleSection
        title="Smoking Status"
        onAdd={() => {
          open();
        }}
      >
        {smokingStatus?.valueCodeableConcept ? (
          <button
            type="button"
            data-testid="smoking-status-button"
            onClick={() => props.onClickResource?.(smokingStatus)}
          >
            <p>{formatCodeableConcept(smokingStatus.valueCodeableConcept)}</p>
          </button>
        ) : (
          <p>(none)</p>
        )}
      </CollapsibleSection>
      <Modal open={opened} onOpenChange={(next) => !next && close()} size="md">
        <ModalHeader>
          <ModalTitle>Set Smoking Status</ModalTitle>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <Label>
                Smoking Status <span className="text-destructive">*</span>
              </Label>
              <RadioGroup name="smokingStatus" value={statusCode} onValueChange={setStatusCode}>
                {Object.entries(smokingStatusOptions).map(([code, text]) => (
                  <div key={code} className="my-2 flex items-center gap-2">
                    <RadioGroupItem value={code} id={`smoking-status-${code}`} />
                    <Label htmlFor={`smoking-status-${code}`}>{text}</Label>
                  </div>
                ))}
              </RadioGroup>
              {statusCode && <input type="hidden" name="smokingStatus" value={statusCode} />}
            </div>
          </ModalBody>
          <ModalFooter>
            <SubmitButton>Save</SubmitButton>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
}
