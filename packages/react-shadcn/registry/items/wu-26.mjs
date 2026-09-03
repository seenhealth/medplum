// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'timeline',
    title: 'Timeline',
    description:
      'Vertical FHIR activity list. TimelineItem is a Panel with author, timestamp, and an optional composed menu.',
    files: ['components/medplum/timeline.tsx'],
    upstream: 'Timeline',
    categories: ['fhir', 'timeline'],
  },
  {
    name: 'resource-timeline',
    title: 'ResourceTimeline',
    description:
      'Loads history and related resources for any FHIR resource, with comment/media composers and getMenu customization.',
    files: ['components/medplum/resource-timeline.tsx'],
    upstream: 'ResourceTimeline',
    categories: ['fhir', 'timeline'],
  },
  {
    name: 'default-resource-timeline',
    title: 'DefaultResourceTimeline',
    description: 'ResourceTimeline wrapper that loads history and related Tasks.',
    files: ['components/medplum/default-resource-timeline.tsx'],
    upstream: 'DefaultResourceTimeline',
    categories: ['fhir', 'timeline'],
  },
  {
    name: 'patient-timeline',
    title: 'PatientTimeline',
    description: 'ResourceTimeline for a Patient: history, clinical resources, comments, and media uploads.',
    files: ['components/medplum/patient-timeline.tsx'],
    upstream: 'PatientTimeline',
    categories: ['fhir', 'timeline'],
  },
  {
    name: 'encounter-timeline',
    title: 'EncounterTimeline',
    description: 'ResourceTimeline for an Encounter: history, Communications, and Media.',
    files: ['components/medplum/encounter-timeline.tsx'],
    upstream: 'EncounterTimeline',
    categories: ['fhir', 'timeline'],
  },
  {
    name: 'service-request-timeline',
    title: 'ServiceRequestTimeline',
    description:
      'ResourceTimeline for a ServiceRequest: history, Communications, DiagnosticReports, Media, documents, and Tasks.',
    files: ['components/medplum/service-request-timeline.tsx'],
    upstream: 'ServiceRequestTimeline',
    categories: ['fhir', 'timeline'],
  },
];
