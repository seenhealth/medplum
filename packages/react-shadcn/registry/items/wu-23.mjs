// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('./core.mjs').RegistryItemSpec[]} */
export const items = [
  {
    name: 'list-with-detail-pane',
    title: 'ListWithDetailPane',
    description:
      'Presentational master-detail shell: sidebar list with optional pill tabs, header actions, pagination, and a detail pane.',
    files: [
      'components/medplum/list-with-detail-pane/list-with-detail-pane.tsx',
      'components/medplum/list-with-detail-pane/list-with-detail-pane-skeleton.tsx',
    ],
    upstream: 'ListWithDetailPane',
    categories: ['layout'],
  },
  {
    name: 'resource-board',
    title: 'ResourceBoard',
    description:
      'Master-detail board that fetches via useResourceBoard and renders ListWithDetailPane, with custom loadItems and tabs.',
    files: ['components/medplum/resource-board.tsx'],
    upstream: 'ResourceBoard',
    categories: ['layout'],
  },
];
