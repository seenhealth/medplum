// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Ported items whose imports point at components from a later work unit. Wired once those land.

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'fhir-path-display',
    title: 'FhirPathDisplay',
    description: 'Evaluate a FHIRPath expression on a resource and display the single result.',
    files: ['components/medplum/fhir-path-display.tsx'],
    upstream: 'FhirPathDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
];
