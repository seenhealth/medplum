// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/SexualOrientation.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { killEvent } from '@/lib/medplum/dom';
import { createReference, HTTP_HL7_ORG, HTTP_TERMINOLOGY_HL7_ORG, LOINC, SNOMED } from '@medplum/core';
import type { Encounter, Observation, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

const NULLFLAVOR = HTTP_TERMINOLOGY_HL7_ORG + '/CodeSystem/v3-NullFlavor';

type SexualOrientationCode = '38628009' | '20430005' | '42035005' | 'OTH' | 'UNK' | 'ASKU';
// Sexual orientation widget
// See: https://hl7.org/fhir/us/core/STU5.0.1/StructureDefinition-us-core-observation-sexual-orientation.html
const CodesToText: Record<SexualOrientationCode, string> = {
  '38628009': 'Homosexual',
  '20430005': 'Heterosexual',
  '42035005': 'Bisexual',
  OTH: 'Other',
  UNK: 'Unknown',
  ASKU: 'Asked but no answer',
};

const CodesToSystem: Record<SexualOrientationCode, string> = {
  38628009: SNOMED,
  20430005: SNOMED,
  42035005: SNOMED,
  OTH: NULLFLAVOR,
  UNK: NULLFLAVOR,
  ASKU: NULLFLAVOR,
};

export interface SexualOrientationProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly sexualOrientation?: Observation;
  readonly onClickResource?: (resource: Observation) => void;
}

export function SexualOrientation(props: SexualOrientationProps): JSX.Element {
  const { patient, encounter } = props;
  const medplum = useMedplum();
  const [sexualOrientation, setSexualOrientation] = useState(props.sexualOrientation);
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [orientationCode, setOrientationCode] = useState<string>('');

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      const code = formData.sexualOrientation as SexualOrientationCode;
      medplum
        .createResource<Observation>({
          resourceType: 'Observation',
          meta: {
            profile: [HTTP_HL7_ORG + '/fhir/us/core/ValueSet/us-core-sexual-orientation'],
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: HTTP_TERMINOLOGY_HL7_ORG + '/CodeSystem/observation-category',
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
                code: '76690-7',
                display: 'Sexual orientation',
              },
            ],
            text: 'Sexual orientation',
          },
          subject: createReference(patient),
          encounter: encounter ? createReference(encounter) : undefined,
          effectiveDateTime: new Date().toISOString(),
          valueCodeableConcept: {
            coding: [
              {
                system: CodesToSystem[code],
                code: formData.sexualOrientation,
              },
            ],
            text: CodesToText[code],
          },
        })
        .then((newSexualOrientation) => {
          setSexualOrientation(newSexualOrientation);
          close();
        })
        .catch(console.error);
    },
    [medplum, patient, encounter, close]
  );

  return (
    <>
      <CollapsibleSection
        title="Sexual Orientation"
        onAdd={() => {
          open();
        }}
      >
        {sexualOrientation ? (
          <div className="flex flex-col gap-2">
            <div onMouseEnter={() => setHoverIndex(0)} onMouseLeave={() => setHoverIndex(null)}>
              <button
                type="button"
                data-testid="sexual-orientation-button"
                onClick={(e) => {
                  killEvent(e);
                  if (props.onClickResource) {
                    props.onClickResource(sexualOrientation);
                  }
                }}
              >
                <div className={hoverIndex === 0 ? 'pr-6' : 'pr-0'}>
                  <p className="text-sm font-medium">{sexualOrientation.valueCodeableConcept?.text ?? 'Unknown'}</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <p>(none)</p>
        )}
      </CollapsibleSection>
      <Modal open={opened} onOpenChange={(next) => !next && close()} size="md">
        <ModalHeader>
          <ModalTitle>Set Sexual Orientation</ModalTitle>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <Label>
                Sexual Orientation <span className="text-destructive">*</span>
              </Label>
              <RadioGroup name="sexualOrientation" value={orientationCode} onValueChange={setOrientationCode}>
                {Object.entries(CodesToText).map(([code, text]) => (
                  <div key={code} className="my-2 flex items-center gap-2">
                    <RadioGroupItem value={code} id={`sexual-orientation-${code}`} />
                    <Label htmlFor={`sexual-orientation-${code}`}>{text}</Label>
                  </div>
                ))}
              </RadioGroup>
              {orientationCode && <input type="hidden" name="sexualOrientation" value={orientationCode} />}
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
