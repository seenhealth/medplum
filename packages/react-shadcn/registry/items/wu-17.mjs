// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @typedef {{ name: string, title: string, description: string, files: string[], upstream?: string, categories?: string[] }} RegistryItemSpec */

/** @type {RegistryItemSpec[]} */
export const items = [
  {
    name: 'resource-input',
    title: 'ResourceInput',
    description: 'Single-value FHIR resource search input over AsyncAutocomplete (maxValues=1).',
    files: ['components/medplum/resource-input.tsx'],
    upstream: 'ResourceInput/ResourceInput.tsx',
    categories: ['fhir', 'input', 'autocomplete'],
  },
  {
    name: 'multi-resource-input',
    title: 'MultiResourceInput',
    description: 'Multi-select FHIR resource search input with avatar item rendering and reference resolution.',
    files: ['components/medplum/multi-resource-input.tsx'],
    upstream: 'ResourceInput/MultiResourceInput.tsx',
    categories: ['fhir', 'input', 'autocomplete'],
  },
  {
    name: 'reference-input',
    title: 'ReferenceInput',
    description: 'FHIR Reference editor with a target-type selector and resource search.',
    files: ['components/medplum/reference-input.tsx'],
    upstream: 'ReferenceInput',
    categories: ['fhir', 'input', 'autocomplete'],
  },
];
