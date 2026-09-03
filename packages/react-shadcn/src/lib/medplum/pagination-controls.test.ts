// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/pagination.test.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { getPaginationControlProps } from '@/lib/medplum/pagination-controls';

describe('Pagination utils', () => {
  test('getPaginationControlProps', () => {
    expect(getPaginationControlProps('next')).toStrictEqual({ 'aria-label': 'Next page' });
    expect(getPaginationControlProps('previous')).toStrictEqual({ 'aria-label': 'Previous page' });
    expect(getPaginationControlProps('first')).toStrictEqual({ 'aria-label': 'First page' });
    expect(getPaginationControlProps('last')).toStrictEqual({ 'aria-label': 'Last page' });
    expect(getPaginationControlProps('unknown')).toStrictEqual({});
  });
});
