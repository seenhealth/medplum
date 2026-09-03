// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactPointDisplay/ContactPointDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactPointDisplay } from '@/components/medplum/contact-point-display';
import { render, screen } from '@/test/render';

describe('ContactPointDisplay', () => {
  test('Handles undefined value', () => {
    render(<ContactPointDisplay />);
  });

  test('Handles empty value', () => {
    render(<ContactPointDisplay value={{}} />);
  });

  test('Renders value', () => {
    render(<ContactPointDisplay value={{ value: 'homer@example.com' }} />);
    expect(screen.getByText('homer@example.com', { exact: false })).toBeInTheDocument();
  });

  test('Renders full', () => {
    render(<ContactPointDisplay value={{ system: 'email', use: 'home', value: 'homer@example.com' }} />);
    expect(screen.getByText('homer@example.com', { exact: false })).toBeInTheDocument();
  });

  test('Only use', () => {
    render(<ContactPointDisplay value={{ use: 'home', value: 'homer@example.com' }} />);
    expect(screen.getByText('homer@example.com', { exact: false })).toBeInTheDocument();
  });

  test('Only system', () => {
    render(<ContactPointDisplay value={{ use: 'home', value: 'homer@example.com' }} />);
    expect(screen.getByText('homer@example.com', { exact: false })).toBeInTheDocument();
  });
});
