// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @typedef {{ name: string, title: string, description: string, files: string[], upstream?: string, categories?: string[] }} RegistryItemSpec */

/** @type {RegistryItemSpec[]} */
export const items = [
  {
    name: 'date-time-input',
    title: 'DateTimeInput',
    description: 'datetime-local input that converts between ISO-8601 (with offset) and local wall time.',
    files: ['components/medplum/date-time-input.tsx', 'components/medplum/date-time-input-utils.ts'],
    upstream: 'DateTimeInput',
    categories: ['fhir', 'input', 'datetime'],
  },
  {
    name: 'calendar-input',
    title: 'CalendarInput',
    description: 'Deprecated Slot[] wrapper around CalendarDateInput.',
    files: ['components/medplum/calendar-input.tsx'],
    upstream: 'CalendarInput',
    categories: ['fhir', 'input', 'datetime'],
  },
  {
    name: 'calendar-date-input',
    title: 'CalendarDateInput',
    description: 'Hand-rolled month grid with available days, earliest-date gating, and drag/shift-click ranges.',
    files: [
      'components/medplum/calendar-date-input/calendar-date-input.tsx',
      'components/medplum/calendar-date-input/calendar-date-input-utils.ts',
      'components/medplum/calendar-date-input/use-day-range-drag.ts',
    ],
    upstream: 'CalendarDateInput',
    categories: ['fhir', 'input', 'datetime'],
  },
  {
    name: 'timing-input',
    title: 'TimingInput',
    description: 'Edit a FHIR Timing value in a modal (repeat period, days of week, times of day).',
    files: ['components/medplum/timing-input.tsx'],
    upstream: 'TimingInput',
    categories: ['fhir', 'input', 'datetime'],
  },
  {
    name: 'form',
    title: 'Form',
    description: 'Plain form wrapper with parseForm plus a SubmitButton that tracks submitting via FormContext.',
    files: [
      'components/medplum/form/form.tsx',
      'components/medplum/form/form-context.ts',
      'components/medplum/form/form-utils.ts',
      'components/medplum/form/submit-button.tsx',
    ],
    upstream: 'Form',
    categories: ['forms'],
  },
  {
    name: 'password-input',
    title: 'PasswordInput',
    description: 'Password field with a visibility toggle in an InputGroup.',
    files: ['components/medplum/password-input.tsx'],
    upstream: 'PasswordInput',
    categories: ['input'],
  },
  {
    name: 'sensitive-textarea',
    title: 'SensitiveTextarea',
    description: 'Masked textarea with a copy-to-clipboard button.',
    files: ['components/medplum/sensitive-textarea.tsx'],
    upstream: 'SensitiveTextarea',
    categories: ['input'],
  },
];
