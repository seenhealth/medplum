// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/StatusBadge/StatusBadge.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { StatusBadge } from '@/components/medplum/status-badge';
import { render, screen } from '@/test/render';

describe('StatusBadge', () => {
  test('Renders', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeDefined();
  });

  test('Renders formatted status', () => {
    render(<StatusBadge status="in-progress" />);
    expect(screen.getByText('in progress')).toBeDefined();
  });
});
