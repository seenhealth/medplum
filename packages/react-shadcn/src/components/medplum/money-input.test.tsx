// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MoneyInput/MoneyInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MoneyInput } from '@/components/medplum/money-input';
import { act, fireEvent, render, screen } from '@/test/render';
import type { Money } from '@medplum/fhirtypes';

describe('MoneyInput', () => {
  test('Renders', () => {
    render(<MoneyInput path="" name="a" defaultValue={{ value: 123, currency: 'USD' }} />);
    expect(screen.getByDisplayValue('123')).toBeDefined();
    expect(screen.getByDisplayValue('USD')).toBeDefined();
  });

  test('Renders undefined value', () => {
    render(<MoneyInput path="" name="a" />);
    expect(screen.getByPlaceholderText('Value')).toBeDefined();
    expect(screen.getByDisplayValue('USD')).toBeDefined();
  });

  test('Set value', async () => {
    let lastValue: Money | undefined = undefined;

    render(<MoneyInput path="" name="a" onChange={(value) => (lastValue = value)} />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Value'), {
        target: { value: '123' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByDisplayValue('USD'), {
        target: { value: 'EUR' },
      });
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({ value: 123, currency: 'EUR' });
  });
});
