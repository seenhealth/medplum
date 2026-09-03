// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Vitals.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FormSection, FormSectionDescription, FormSectionLabel } from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import {
  createCompoundObservation,
  createLoincCode,
  createObservation,
  createQuantity,
  getObservationValue,
} from '@/components/medplum/patient-summary/vitals-utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatQuantity } from '@medplum/core';
import type { Encounter, Observation, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

interface ObservationMeta {
  readonly name: string;
  readonly short: string;
  readonly code: string;
  readonly component?: string;
  readonly title: string;
  readonly unit: string;
}

const BP = '85354-9';
const SYSTOLIC = '8480-6';
const DIASTOLIC = '8462-4';

const LOINC_CODES: ObservationMeta[] = [
  {
    name: 'systolic',
    short: 'BP Sys',
    code: BP,
    component: SYSTOLIC,
    title: 'Blood Pressure',
    unit: 'mm[Hg]',
  },
  {
    name: 'diastolic',
    short: 'BP Dias',
    code: BP,
    component: DIASTOLIC,
    title: 'Blood Pressure',
    unit: 'mm[Hg]',
  },
  {
    name: 'heartRate',
    short: 'HR',
    code: '8867-4',
    title: 'Heart Rate',
    unit: '/min',
  },
  {
    name: 'bodyTemperature',
    short: 'Temp',
    code: '8310-5',
    title: 'Body Temperature',
    unit: 'Cel',
  },
  {
    name: 'respiratoryRate',
    short: 'RR',
    code: '9279-1',
    title: 'Respiratory Rate',
    unit: '/min',
  },
  {
    name: 'height',
    short: 'Ht',
    code: '8302-2',
    title: 'Height',
    unit: 'cm',
  },
  {
    name: 'weight',
    short: 'Wt',
    code: '29463-7',
    title: 'Weight',
    unit: 'kg',
  },
  {
    name: 'bmi',
    short: 'BMI',
    code: '39156-5',
    title: 'BMI',
    unit: 'kg/m2',
  },
  {
    name: 'oxygen',
    short: 'O2',
    code: '2708-6',
    title: 'Oxygen',
    unit: '%',
  },
  {
    name: 'headCircumference',
    short: 'HC',
    code: '9843-4',
    title: 'Head Circumference',
    unit: 'cm',
  },
];

export interface VitalsProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly vitals: Observation[];
  readonly onClickResource?: (resource: Observation) => void;
}

export function Vitals(props: VitalsProps): JSX.Element {
  const medplum = useMedplum();
  const { patient, encounter } = props;
  const [vitals, setVitals] = useState(props.vitals);
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      const newObservations = [];

      // Blood pressure is special because it has two components
      newObservations.push(
        createCompoundObservation(patient, encounter, BP, 'Blood pressure', [
          {
            code: createLoincCode(SYSTOLIC, 'Systolic blood pressure'),
            valueQuantity: createQuantity(Number.parseFloat(formData['systolic']), 'mm[Hg]'),
          },
          {
            code: createLoincCode(DIASTOLIC, 'Diastolic blood pressure'),
            valueQuantity: createQuantity(Number.parseFloat(formData['diastolic']), 'mm[Hg]'),
          },
        ])
      );

      for (const meta of LOINC_CODES) {
        if (meta.component) {
          continue;
        }
        newObservations.push(
          createObservation(
            patient,
            encounter,
            meta.code,
            meta.title,
            createQuantity(Number.parseFloat(formData[meta.name]), meta.unit)
          )
        );
      }

      Promise.all(newObservations.filter(Boolean).map((obs) => medplum.createResource(obs as Observation)))
        .then((newVitals) => setVitals([...newVitals, ...vitals]))
        .catch(console.error);

      close();
    },
    [medplum, patient, encounter, vitals, close]
  );

  return (
    <>
      <CollapsibleSection
        title="Vitals"
        onAdd={() => {
          open();
        }}
      >
        <div className="flex flex-col gap-4">
          {LOINC_CODES.map((meta) => {
            const obs = vitals.find((o) => o.code?.coding?.[0].code === meta.code);
            return (
              <div className="flex items-center gap-4" key={meta.name}>
                <p className="text-muted-foreground">{meta.short}</p>
                {obs && <p>{formatQuantity(getObservationValue(obs, meta.component))}</p>}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <Modal open={opened} onOpenChange={(next) => !next && close()} size="md">
        <ModalHeader>
          <ModalTitle>Add Vitals</ModalTitle>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {LOINC_CODES.map((meta, index) => (
                  <FormSection key={meta.name} htmlFor={meta.name}>
                    <FormSectionLabel>{meta.short}</FormSectionLabel>
                    <FormSectionDescription>
                      {meta.title} ({meta.unit})
                    </FormSectionDescription>
                    <Input id={meta.name} name={meta.name} data-autofocus={index === 0} autoFocus={index === 0} />
                  </FormSection>
                ))}
              </div>
              <FormSection htmlFor="notes">
                <FormSectionLabel>Notes</FormSectionLabel>
                <Textarea id="notes" name="notes" className="field-sizing-content min-h-16" />
              </FormSection>
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
