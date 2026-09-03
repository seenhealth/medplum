// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'resource-property-display',
    title: 'ResourcePropertyDisplay',
    description: 'Dispatch a FHIR property to the matching display leaf, including secret-field masking.',
    files: [
      'components/medplum/resource-property-display.tsx',
      'components/medplum/resource-property-display-utils.ts',
    ],
    upstream: 'ResourcePropertyDisplay',
    categories: ['fhir', 'display', 'forms'],
  },
  {
    name: 'resource-array-input-utils',
    title: 'ResourceArrayInput utils',
    description: 'prepareSlices and assignValuesIntoSlices for profile-sliced FHIR arrays.',
    files: ['components/medplum/resource-array-input-utils.ts'],
    upstream: 'ResourceArrayInput/ResourceArrayInput.utils.ts',
    categories: ['fhir', 'display', 'forms'],
  },
  {
    name: 'backbone-element-display',
    title: 'BackboneElementDisplay',
    description: 'Read-only DescriptionList of a BackboneElement via ElementsContext.',
    files: ['components/medplum/backbone-element-display.tsx'],
    upstream: 'BackboneElementDisplay',
    categories: ['fhir', 'display', 'forms'],
  },
  {
    name: 'slice-display',
    title: 'SliceDisplay',
    description: 'Read-only render of one profile slice, wrapping children in ElementsContext.',
    files: ['components/medplum/slice-display.tsx'],
    upstream: 'SliceDisplay',
    categories: ['fhir', 'display', 'forms'],
  },
  {
    name: 'resource-array-display',
    title: 'ResourceArrayDisplay',
    description: 'Read-only sliced FHIR array with a 50-item cap and total-count overflow.',
    files: ['components/medplum/resource-array-display.tsx'],
    upstream: 'ResourceArrayDisplay',
    categories: ['fhir', 'display', 'forms'],
  },
  {
    name: 'extension-display',
    title: 'ExtensionDisplay',
    description: 'Read-only FHIR Extension via value[x] or a profiled BackboneElementDisplay.',
    files: ['components/medplum/extension-display.tsx'],
    upstream: 'ExtensionDisplay',
    categories: ['fhir', 'display', 'forms'],
  },
];
