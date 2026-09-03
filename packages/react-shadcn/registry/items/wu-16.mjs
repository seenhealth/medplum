// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'value-set-autocomplete',
    title: 'ValueSetAutocomplete',
    description: 'Autocomplete options from a FHIR ValueSet expansion, with unavailable-binding notes.',
    files: ['components/medplum/value-set-autocomplete.tsx'],
    upstream: 'ValueSetAutocomplete',
    categories: ['fhir', 'input', 'autocomplete'],
  },
  {
    name: 'code-input',
    title: 'CodeInput',
    description: 'Single FHIR code string input backed by ValueSetAutocomplete.',
    files: ['components/medplum/code-input.tsx'],
    upstream: 'CodeInput',
    categories: ['fhir', 'input', 'autocomplete'],
  },
  {
    name: 'coding-input',
    title: 'CodingInput',
    description: 'Single FHIR Coding input backed by ValueSetAutocomplete.',
    files: ['components/medplum/coding-input.tsx'],
    upstream: 'CodingInput',
    categories: ['fhir', 'input', 'autocomplete'],
  },
  {
    name: 'codeable-concept-input',
    title: 'CodeableConceptInput',
    description: 'FHIR CodeableConcept input backed by ValueSetAutocomplete.',
    files: ['components/medplum/codeable-concept-input.tsx'],
    upstream: 'CodeableConceptInput',
    categories: ['fhir', 'input', 'autocomplete'],
  },
  {
    name: 'resource-type-input',
    title: 'ResourceTypeInput',
    description: 'Autocomplete over FHIR resource types via the resource-types ValueSet.',
    files: ['components/medplum/resource-type-input.tsx'],
    upstream: 'ResourceTypeInput',
    categories: ['fhir', 'input', 'autocomplete'],
  },
];
