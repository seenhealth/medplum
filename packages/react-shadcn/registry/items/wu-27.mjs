// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'diagnostic-report-display',
    title: 'DiagnosticReportDisplay',
    description: 'Display a FHIR DiagnosticReport with specimen info, grouped observations, and performing labs.',
    files: ['components/medplum/diagnostic-report-display.tsx'],
    upstream: 'DiagnosticReportDisplay',
    categories: ['fhir', 'display'],
  },
  {
    name: 'measure-report-display',
    title: 'MeasureReportDisplay',
    description: 'Display a FHIR MeasureReport with group scores as ring progress or quantity values.',
    files: [
      'components/medplum/measure-report-display/measure-report-display.tsx',
      'components/medplum/measure-report-display/measure-report-group-display.tsx',
    ],
    upstream: 'MeasureReportDisplay',
    categories: ['fhir', 'display'],
  },
  {
    name: 'patient-header',
    title: 'PatientHeader',
    description: 'Info bar header for a FHIR Patient: name, age, gender, identifiers.',
    files: ['components/medplum/patient-header.tsx', 'components/medplum/patient-header-utils.ts'],
    upstream: 'PatientHeader',
    categories: ['fhir', 'display'],
  },
  {
    name: 'smart-app-launch-link',
    title: 'SmartAppLaunchLink',
    description: 'Anchor that creates a SMART App Launch context and opens the client launch URI.',
    files: ['components/medplum/smart-app-launch-link.tsx'],
    upstream: 'SmartAppLaunchLink',
    categories: ['fhir', 'display'],
  },
  {
    name: 'scheduler',
    title: 'Scheduler',
    description: 'Calendar plus time-slot picker over one or more FHIR Schedules.',
    files: ['components/medplum/scheduler.tsx'],
    upstream: 'Scheduler',
    categories: ['scheduling'],
  },
  {
    name: 'patient-export-form',
    title: 'PatientExportForm',
    description: 'Export a Patient as FHIR Everything, summary, or C-CDA.',
    files: ['components/medplum/patient-export-form.tsx'],
    upstream: 'PatientExportForm',
    categories: ['forms'],
  },
  {
    name: 'patient-accounts-form',
    title: 'PatientAccountsForm',
    description: 'Admin form to add and remove Patient meta.accounts with optional compartment propagation.',
    files: ['components/medplum/patient-accounts-form.tsx'],
    upstream: 'PatientAccountsForm',
    categories: ['forms'],
  },
];
