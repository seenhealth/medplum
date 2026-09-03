// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientExportForm/PatientExportForm.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { convertLocalToIso } from '@/components/medplum/date-time-input-utils';
import {
  FormSection,
  FormSectionDescription,
  FormSectionError,
  FormSectionLabel,
} from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { ReferenceInput } from '@/components/medplum/reference-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { notify } from '@/lib/medplum/notify';
import { ContentType, normalizeErrorString, resolveId } from '@medplum/core';
import type { Patient, Reference } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface PatientExportFormProps {
  readonly patient: Patient | Reference<Patient>;
}

const NOTIFICATION_ID = 'patient-export';
const NOTIFICATION_TITLE = 'Patient Export';

interface FormatDefinition {
  operation: string;
  type?: string;
  extension: string;
  contentType: string;
}

const formats: Record<string, FormatDefinition> = {
  everything: {
    operation: '$everything',
    extension: 'json',
    contentType: ContentType.FHIR_JSON,
  },
  summary: {
    operation: '$summary',
    extension: 'json',
    contentType: ContentType.FHIR_JSON,
  },
  ccda: {
    operation: '$ccda-export',
    extension: 'xml',
    contentType: ContentType.CDA_XML,
  },
  ccdaReferral: {
    operation: '$ccda-export',
    type: 'referral',
    extension: 'xml',
    contentType: ContentType.CDA_XML,
  },
};

export function PatientExportForm(props: PatientExportFormProps): JSX.Element {
  const medplum = useMedplum();
  const { patient } = props;
  const [format, setFormat] = useState('everything');
  const [inlineAttachments, setInlineAttachments] = useState(false);

  const handleSubmit = useCallback(
    async (data: Record<string, string>) => {
      const patientId = resolveId(patient) as string;
      const { operation, type, contentType, extension } = formats[format];
      const url = medplum.fhirUrl('Patient', patientId, operation);
      const params = {} as Record<string, unknown>;

      if (format === 'everything' && inlineAttachments) {
        url.searchParams.set('_inlineAttachments', 'true');
      }

      if (type) {
        params.type = type;
      }

      if (data.author) {
        params.author = { reference: data.author };
      }

      if (data.authoredOn) {
        params.authoredOn = convertLocalToIso(data.authoredOn);
      }

      if (data.startDate) {
        params.start = data.startDate;
      }

      if (data.endDate) {
        params.end = data.endDate;
      }

      notify.show({
        id: NOTIFICATION_ID,
        title: NOTIFICATION_TITLE,
        loading: true,
        message: 'Exporting...',
        autoClose: false,
      });

      try {
        const response = await medplum.post(url, params, undefined, {
          cache: 'no-cache',
          headers: { Accept: contentType },
        });

        const fileName = `Patient-export-${patientId}-${new Date().toISOString().replaceAll(':', '-')}.${extension}`;

        saveData(response, fileName, contentType);

        notify.update(NOTIFICATION_ID, {
          title: NOTIFICATION_TITLE,
          color: 'green',
          message: 'Done',
          loading: false,
        });
      } catch (err) {
        notify.update(NOTIFICATION_ID, {
          title: NOTIFICATION_TITLE,
          color: 'red',
          message: normalizeErrorString(err),
          loading: false,
          autoClose: false,
        });
      }
    },
    [medplum, patient, format, inlineAttachments]
  );

  return (
    <Form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <FormSection>
          <FormSectionLabel required>Export Format</FormSectionLabel>
          <FormSectionDescription>Required</FormSectionDescription>
          <ToggleGroup
            type="single"
            className="w-full"
            value={format}
            onValueChange={(value) => {
              if (value) {
                setFormat(value);
              }
            }}
          >
            <ToggleGroupItem value="everything">FHIR Everything</ToggleGroupItem>
            <ToggleGroupItem value="summary">Patient Summary</ToggleGroupItem>
            <ToggleGroupItem value="ccda">C-CDA</ToggleGroupItem>
            <ToggleGroupItem value="ccdaReferral">C-CDA Referral</ToggleGroupItem>
          </ToggleGroup>
          <FormSectionError />
        </FormSection>
        <FormSection>
          <FormSectionLabel>Author</FormSectionLabel>
          <FormSectionDescription>
            Optional author for composition. Default value is current user.
          </FormSectionDescription>
          <ReferenceInput
            name="author"
            placeholder="Author"
            targetTypes={['Organization', 'Practitioner', 'PractitionerRole']}
          />
          <FormSectionError />
        </FormSection>
        <FormSection>
          <FormSectionLabel>Authored On</FormSectionLabel>
          <FormSectionDescription>
            Optional date for composition authored on. Default value is current date.
          </FormSectionDescription>
          <DateTimeInput name="authoredOn" placeholder="Authored on" />
          <FormSectionError />
        </FormSection>
        <FormSection>
          <FormSectionLabel>Start Date</FormSectionLabel>
          <FormSectionDescription>
            The start date of care. If no start date is provided, all records prior to the end date are in scope.
          </FormSectionDescription>
          <DateTimeInput name="startDate" placeholder="Start date" />
          <FormSectionError />
        </FormSection>
        <FormSection>
          <FormSectionLabel>End Date</FormSectionLabel>
          <FormSectionDescription>
            The end date of care. If no end date is provided, all records subsequent to the start date are in scope.
          </FormSectionDescription>
          <DateTimeInput name="endDate" placeholder="End date" />
          <FormSectionError />
        </FormSection>
        {format === 'everything' && (
          <FormSection>
            <FormSectionLabel>Inline Attachments</FormSectionLabel>
            <FormSectionDescription>
              Embed DocumentReference file attachments as base64-encoded data instead of storage URLs.
            </FormSectionDescription>
            <div className="flex flex-col gap-2">
              <Field orientation="horizontal">
                <Checkbox
                  id="inline-attachments"
                  checked={inlineAttachments}
                  onCheckedChange={(checked) => setInlineAttachments(checked === true)}
                />
                <FieldLabel htmlFor="inline-attachments">Inline attachments</FieldLabel>
              </Field>
            </div>
            <FormSectionError />
          </FormSection>
        )}
        <div className="flex justify-end">
          <SubmitButton>Request Export</SubmitButton>
        </div>
      </div>
    </Form>
  );
}

/**
 * Tricks the browser into downloading a file.
 *
 * This function creates a temporary anchor (<a>) element, converts the provided data to a Blob,
 * and then simulates a click on the link to trigger a file download in the browser.
 *
 * See: https://stackoverflow.com/a/19328891
 *
 * @param data - The data to save.
 * @param fileName - The name of the file.
 * @param contentType - The content type of the file.
 */
function saveData(data: unknown, fileName: string, contentType: string): void {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
