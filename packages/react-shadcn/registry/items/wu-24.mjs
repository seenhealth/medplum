// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'questionnaire-form',
    title: 'QuestionnaireForm',
    description: 'Render and submit FHIR Questionnaires, including paginated, repeating, and AI voice-assisted forms.',
    files: [
      'components/medplum/questionnaire-form/questionnaire-form.tsx',
      'components/medplum/questionnaire-form/ai-real-time-questionnaire-form.tsx',
      'components/medplum/questionnaire-form/questionnaire-form-group.tsx',
      'components/medplum/questionnaire-form/questionnaire-form-item.tsx',
      'components/medplum/questionnaire-form/questionnaire-form-item-array.tsx',
      'components/medplum/questionnaire-form/questionnaire-form-repeatable-group.tsx',
      'components/medplum/questionnaire-form/questionnaire-form-repeatable-item.tsx',
      'components/medplum/questionnaire-form/questionnaire-form-stepper.tsx',
    ],
    upstream: 'QuestionnaireForm',
    categories: ['fhir', 'forms', 'questionnaire'],
  },
];
