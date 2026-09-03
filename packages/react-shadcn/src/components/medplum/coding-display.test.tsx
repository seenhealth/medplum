// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodingDisplay/CodingDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodingDisplay } from '@/components/medplum/coding-display';
import { render, screen } from '@/test/render';

describe('CodingDisplay', () => {
  test('Renders display', () => {
    render(<CodingDisplay value={{ display: 'Display Text', code: '123' }} />);
    expect(screen.getByText('Display Text')).toBeInTheDocument();
    expect(screen.queryByText('123')).not.toBeInTheDocument();
  });

  test('Renders code', () => {
    render(<CodingDisplay value={{ code: '123' }} />);
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  test('Renders undefined value', () => {
    render(<CodingDisplay />);
  });

  test('Renders display with code when includeCode is true', () => {
    render(<CodingDisplay value={{ display: 'Display Text', code: '123' }} includeCode />);
    expect(screen.getByText('Display Text (123)')).toBeInTheDocument();
  });
});
