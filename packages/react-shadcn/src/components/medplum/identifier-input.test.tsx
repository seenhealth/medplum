// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/IdentifierInput/IdentifierInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { IdentifierInput } from '@/components/medplum/identifier-input';
import { act, fireEvent, render, screen } from '@/test/render';
import type { Identifier } from '@medplum/fhirtypes';

describe('IdentifierInput', () => {
  test('Renders', () => {
    render(
      <IdentifierInput
        name="test"
        path="test"
        onChange={vi.fn()}
        outcome={undefined}
        defaultValue={{ system: 'x', value: 'y' }}
      />
    );
    expect(screen.getByDisplayValue('x')).toBeDefined();
    expect(screen.getByDisplayValue('y')).toBeDefined();
  });

  test('Renders undefined value', () => {
    render(<IdentifierInput name="test" path="test" onChange={vi.fn()} outcome={undefined} />);
    expect(screen.getByPlaceholderText('System')).toBeDefined();
    expect(screen.getByPlaceholderText('Value')).toBeDefined();
  });

  test('Set value', async () => {
    let lastValue: Identifier | undefined = undefined;

    render(<IdentifierInput name="test" path="test" outcome={undefined} onChange={(value) => (lastValue = value)} />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('System'), {
        target: { value: 's' },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Value'), {
        target: { value: 'v' },
      });
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({ system: 's', value: 'v' });
  });
});
