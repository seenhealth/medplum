// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'resource-table',
    title: 'ResourceTable',
    description: 'Schema-driven read-only table of a FHIR resource via BackboneElementDisplay.',
    files: ['components/medplum/resource-table.tsx'],
    upstream: 'ResourceTable',
    categories: ['fhir', 'display'],
  },
  {
    name: 'resource-history-table',
    title: 'ResourceHistoryTable',
    description: 'Version-history table with author, on-behalf-of, date, and version link columns.',
    files: ['components/medplum/resource-history-table.tsx'],
    upstream: 'ResourceHistoryTable',
    categories: ['fhir', 'display'],
  },
  {
    name: 'resource-diff',
    title: 'ResourceDiff',
    description: 'Line-level preformatted diff of two FHIR resources.',
    files: ['components/medplum/resource-diff.tsx'],
    upstream: 'ResourceDiff',
    categories: ['fhir', 'display'],
  },
  {
    name: 'resource-diff-row',
    title: 'ResourceDiffRow',
    description: 'One before/after property row in a resource diff table, with attachment expand.',
    files: ['components/medplum/resource-diff-row.tsx'],
    upstream: 'ResourceDiffRow',
    categories: ['fhir', 'display'],
  },
  {
    name: 'resource-diff-table',
    title: 'ResourceDiffTable',
    description: 'Schema-driven table of JSON-patch operations between two resource versions.',
    files: ['components/medplum/resource-diff-table.tsx'],
    upstream: 'ResourceDiffTable',
    categories: ['fhir', 'display'],
  },
  {
    name: 'resource-blame',
    title: 'ResourceBlame',
    description: 'Line-level blame view attributing each resource line to the history version that introduced it.',
    files: [
      'components/medplum/resource-blame/resource-blame.tsx',
      'components/medplum/resource-blame/resource-blame-utils.ts',
    ],
    upstream: 'ResourceBlame',
    categories: ['fhir', 'display'],
  },
];
