// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'questionnaire-response-display',
    title: 'QuestionnaireResponseDisplay',
    description: 'Read-only recursive display of a FHIR QuestionnaireResponse, switching on each answer value[x].',
    files: [
      'components/medplum/questionnaire-response-display/questionnaire-response-display.tsx',
      'components/medplum/questionnaire-response-display/questionnaire-response-item-display.tsx',
    ],
    upstream: 'QuestionnaireResponseDisplay',
    categories: ['fhir', 'display'],
  },
  {
    name: 'request-group-display',
    title: 'RequestGroupDisplay',
    description: 'Display a FHIR RequestGroup as a task list with Start/Edit actions.',
    files: ['components/medplum/request-group-display.tsx'],
    upstream: 'RequestGroupDisplay',
    categories: ['fhir', 'display'],
  },
  {
    name: 'reference-range-editor',
    title: 'ReferenceRangeEditor',
    description: 'Editor for ObservationDefinition qualified intervals grouped by filter criteria.',
    files: ['components/medplum/reference-range-editor.tsx'],
    upstream: 'ReferenceRangeEditor',
    categories: ['fhir', 'editor'],
  },
  {
    name: 'plan-definition-builder',
    title: 'PlanDefinitionBuilder',
    description: 'Builder for a FHIR PlanDefinition with selected/hover action editing.',
    files: ['components/medplum/plan-definition-builder.tsx'],
    upstream: 'PlanDefinitionBuilder',
    categories: ['fhir', 'editor'],
  },
  {
    name: 'questionnaire-builder',
    title: 'QuestionnaireBuilder',
    description: 'Builder for a FHIR Questionnaire with selected/hover item editing and QuestionnaireForm preview.',
    files: ['components/medplum/questionnaire-builder.tsx'],
    upstream: 'QuestionnaireBuilder',
    categories: ['fhir', 'forms', 'questionnaire'],
  },
];
