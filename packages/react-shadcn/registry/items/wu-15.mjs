// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'async-autocomplete',
    title: 'AsyncAutocomplete',
    description: 'Debounced asynchronous autocomplete with multiple selection, pills, and creatable options.',
    files: [
      'components/medplum/async-autocomplete.tsx',
      'components/medplum/async-autocomplete-utils.ts',
      'test/async-autocomplete.ts',
    ],
    upstream: 'AsyncAutocomplete',
    categories: ['input', 'autocomplete'],
  },
];
