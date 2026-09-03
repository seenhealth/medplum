// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactDetailInput/ContactDetailInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactDetailInput } from '@/components/medplum/contact-detail-input';
import { act, fireEvent, render, screen } from '@/test/render';
import { stringify } from '@medplum/core';
import type { ContactDetail } from '@medplum/fhirtypes';

describe('ContactDetailInput', () => {
  test('Renders', () => {
    render(
      <ContactDetailInput
        name="test"
        path="test"
        onChange={vi.fn()}
        outcome={undefined}
        defaultValue={{ name: 'Foo', telecom: [{ system: 'email', value: 'abc@example.com' }] }}
      />
    );

    const system = screen.getByTestId<HTMLInputElement>('system');
    expect(system).toBeDefined();
    expect(system.value).toEqual('email');

    const value = screen.getByPlaceholderText<HTMLInputElement>('Value');
    expect(value).toBeDefined();
    expect(value.value).toEqual('abc@example.com');
  });

  test('Change events', async () => {
    let lastValue: ContactDetail | undefined = undefined;

    render(
      <ContactDetailInput
        name="test"
        path="test"
        outcome={undefined}
        defaultValue={{}}
        onChange={(value) => (lastValue = value)}
      />
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Foo' } });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('use'), { target: { value: 'home' } });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('system'), { target: { value: 'email' } });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Value'), { target: { value: 'xyz@example.com' } });
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({
      name: 'Foo',
      telecom: [
        {
          use: 'home',
          system: 'email',
          value: 'xyz@example.com',
        },
      ],
    });
  });

  test('Set blanks', async () => {
    let lastValue: ContactDetail | undefined = undefined;

    render(
      <ContactDetailInput
        name="test"
        path="test"
        outcome={undefined}
        defaultValue={{
          name: 'Foo',
          telecom: [
            {
              use: 'home',
              system: 'email',
              value: 'abc@example.com',
            },
          ],
        }}
        onChange={(value) => (lastValue = value)}
      />
    );

    await act(async () => {
      fireEvent.change(screen.getByDisplayValue('Foo'), { target: { value: '' } });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('use'), { target: { value: '' } });
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('system'), { target: { value: '' } });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Value'), {
        target: { value: '' },
      });
    });

    expect(lastValue).toBeDefined();
    expect(stringify(lastValue)).toStrictEqual('');
  });
});
