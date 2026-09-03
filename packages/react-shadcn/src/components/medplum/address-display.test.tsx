// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AddressDisplay/AddressDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AddressDisplay } from '@/components/medplum/address-display';
import { render, screen } from '@/test/render';

describe('AddressDisplay', () => {
  test('Renders', () => {
    render(<AddressDisplay value={{ line: ['123 main st'], city: 'Happy' }} />);
    expect(screen.getByText('123 main st, Happy')).toBeInTheDocument();
  });

  test('Renders undefined value', () => {
    render(<AddressDisplay />);
  });

  test('Renders with use option', () => {
    render(<AddressDisplay value={{ line: ['123 main st'], city: 'Happy', use: 'home' }} options={{ use: true }} />);
    expect(screen.getByText('123 main st, Happy, [home]')).toBeInTheDocument();
  });

  test('Renders with lineSeparator option', () => {
    render(
      <AddressDisplay
        value={{ line: ['123 main st'], city: 'Happy', state: 'CA' }}
        options={{ lineSeparator: ' | ' }}
      />
    );
    expect(screen.getByText('123 main st | Happy, CA')).toBeInTheDocument();
  });
});
