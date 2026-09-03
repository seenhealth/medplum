// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'patient-summary',
    title: 'PatientSummary',
    description:
      'Collapsible clinical summary for a Patient: demographics, insurance, allergies, problems, medications, immunizations, labs, social history, vitals, goals, and pharmacies.',
    files: [
      'components/medplum/patient-summary/patient-summary.tsx',
      'components/medplum/patient-summary/patient-summary-types.ts',
      'components/medplum/patient-summary/patient-summary-utils.ts',
      'components/medplum/patient-summary/collapsible-section.tsx',
      'components/medplum/patient-summary/summary-item.tsx',
      'components/medplum/patient-summary/patient-info-item.tsx',
      'components/medplum/patient-summary/allergies.tsx',
      'components/medplum/patient-summary/allergy-dialog.tsx',
      'components/medplum/patient-summary/problem-list.tsx',
      'components/medplum/patient-summary/condition-dialog.tsx',
      'components/medplum/patient-summary/medications.tsx',
      'components/medplum/patient-summary/medication-dialog.tsx',
      'components/medplum/patient-summary/immunizations.tsx',
      'components/medplum/patient-summary/immunization-dialog.tsx',
      'components/medplum/patient-summary/goals.tsx',
      'components/medplum/patient-summary/goal-dialog.tsx',
      'components/medplum/patient-summary/labs.tsx',
      'components/medplum/patient-summary/insurance.tsx',
      'components/medplum/patient-summary/sexual-orientation.tsx',
      'components/medplum/patient-summary/smoking-status.tsx',
      'components/medplum/patient-summary/vitals.tsx',
      'components/medplum/patient-summary/vitals-utils.ts',
      'components/medplum/patient-summary/pharmacies.tsx',
      'components/medplum/patient-summary/pharmacy-dialog.tsx',
      'components/medplum/patient-summary/pharmacy-utils.ts',
      'components/medplum/patient-summary/section-configs.tsx',
      'components/medplum/patient-summary/summary-resource-list-section.tsx',
    ],
    upstream: 'PatientSummary',
    categories: ['fhir', 'clinical'],
  },
];
