// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AddressInput/AddressInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AddressInput } from '@/components/medplum/address-input';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { act, fireEvent, render, screen } from '@/test/render';
import type { Address } from '@medplum/fhirtypes';

const defaultProps: ComplexTypeInputProps<Address> = {
  name: 'a',
  path: 'Resource.address',
  onChange: undefined,
  outcome: undefined,
};

describe('AddressInput', () => {
  test('Renders', () => {
    render(<AddressInput {...defaultProps} defaultValue={{ line: ['123 main st'], city: 'Happy' }} />);
    expect(screen.getByDisplayValue('123 main st')).toBeDefined();
    expect(screen.getByDisplayValue('Happy')).toBeDefined();
  });

  test('Renders undefined value', () => {
    render(<AddressInput {...defaultProps} />);
    expect(screen.queryByDisplayValue('123 main st')).toBeNull();
  });

  test('Set value', async () => {
    let lastValue: Address | undefined = undefined;

    render(<AddressInput {...defaultProps} onChange={(value) => (lastValue = value)} />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('address-use'), {
        target: { value: 'home' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('address-type'), {
        target: { value: 'both' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Line 1'), {
        target: { value: '742 Evergreen Terrace' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Line 2'), {
        target: { value: 'Attn: Homer' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('City'), {
        target: { value: 'Springfield' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('State'), {
        target: { value: 'OR' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Postal Code'), {
        target: { value: '97403' },
      });
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({
      use: 'home',
      type: 'both',
      line: ['742 Evergreen Terrace', 'Attn: Homer'],
      city: 'Springfield',
      state: 'OR',
      postalCode: '97403',
    });
  });

  test('Remove 2nd line', async () => {
    let lastValue: Address | undefined = undefined;

    render(
      <AddressInput
        {...defaultProps}
        defaultValue={{ line: ['line 1', 'line 2'] }}
        onChange={(value) => (lastValue = value)}
      />
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Line 2'), {
        target: { value: '' },
      });
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({ line: ['line 1'] });
  });
});
