// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'resource-form-utils',
    title: 'ResourceForm utils',
    description: 'Set schema-driven FHIR property values and identify supported profile definitions.',
    files: ['components/medplum/resource-form-utils.ts'],
    upstream: 'ResourceForm/ResourceForm.utils.ts',
    categories: ['fhir', 'input', 'forms'],
  },
  {
    name: 'resource-property-input',
    title: 'ResourcePropertyInput',
    description: 'Dispatch a FHIR schema property to the matching primitive, complex, or array input.',
    files: ['components/medplum/resource-property-input.tsx'],
    upstream: 'ResourcePropertyInput/ResourcePropertyInput.tsx',
    categories: ['fhir', 'input', 'forms'],
  },
  {
    name: 'elements-input',
    title: 'ElementsInput',
    description: 'Render and update the schema-defined elements of a FHIR value.',
    files: ['components/medplum/elements-input.tsx'],
    upstream: 'ElementsInput/ElementsInput.tsx',
    categories: ['fhir', 'input', 'forms'],
  },
  {
    name: 'backbone-element-input',
    title: 'BackboneElementInput',
    description: 'Edit a complex FHIR type through a nested schema-driven ElementsContext.',
    files: ['components/medplum/backbone-element-input.tsx'],
    upstream: 'BackboneElementInput/BackboneElementInput.tsx',
    categories: ['fhir', 'input', 'forms'],
  },
  {
    name: 'slice-input',
    title: 'SliceInput',
    description: 'Edit one named profile slice with cardinality-aware add and remove controls.',
    files: ['components/medplum/slice-input.tsx'],
    upstream: 'SliceInput/SliceInput.tsx',
    categories: ['fhir', 'input', 'forms'],
  },
  {
    name: 'resource-array-input',
    title: 'ResourceArrayInput',
    description: 'Edit sliced and non-sliced values for a repeating FHIR schema property.',
    files: ['components/medplum/resource-array-input.tsx'],
    upstream: 'ResourceArrayInput/ResourceArrayInput.tsx',
    categories: ['fhir', 'input', 'forms'],
  },
  {
    name: 'extension-input',
    title: 'ExtensionInput',
    description: 'Load an extension profile and edit the Extension as a nested backbone element.',
    files: ['components/medplum/extension-input.tsx'],
    upstream: 'ExtensionInput/ExtensionInput.tsx',
    categories: ['fhir', 'input', 'forms'],
  },
  {
    name: 'resource-form',
    title: 'ResourceForm',
    description: 'Schema-driven FHIR resource form with create, update, patch, and delete actions.',
    files: ['components/medplum/resource-form.tsx'],
    upstream: 'ResourceForm/ResourceForm.tsx',
    categories: ['fhir', 'input', 'forms'],
  },
];
