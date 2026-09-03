// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MoneyDisplay/MoneyDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MoneyDisplay } from '@/components/medplum/money-display';
import { render, screen } from '@/test/render';

describe('MoneyDisplay', () => {
  test('Undefined value', () => {
    render(
      <span>
        test
        <MoneyDisplay />
      </span>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('Empty value', () => {
    render(
      <span>
        test
        <MoneyDisplay value={{}} />
      </span>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('Default currency', () => {
    render(<MoneyDisplay value={{ value: 10.1 }} />);
    expect(screen.getByText('$10.10')).toBeInTheDocument();
  });

  test('USD', () => {
    render(<MoneyDisplay value={{ value: 10.1, currency: 'USD' }} />);
    expect(screen.getByText('$10.10')).toBeInTheDocument();
  });

  test('EUR', () => {
    render(<MoneyDisplay value={{ value: 10.1, currency: 'EUR' }} />);
    expect(screen.getByText('€10.10')).toBeInTheDocument();
  });
});
