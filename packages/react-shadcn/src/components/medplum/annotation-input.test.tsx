// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AnnotationInput/AnnotationInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { AnnotationInputProps } from '@/components/medplum/annotation-input';
import { AnnotationInput } from '@/components/medplum/annotation-input';
import { act, fireEvent, render, screen } from '@/test/render';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

function setup(args: AnnotationInputProps): void {
  render(
    <MedplumProvider medplum={medplum}>
      <AnnotationInput {...args} />
    </MedplumProvider>
  );
}

describe('AnnotationInput', () => {
  test('Renders undefined value', () => {
    setup({
      path: '',
      name: 'a',
    });
    expect(screen.queryByDisplayValue('Hello world')).toBeNull();
  });

  test('Renders default value', () => {
    setup({
      path: '',
      name: 'a',
      defaultValue: {
        text: 'Hello world',
      },
    });
    expect(screen.getByDisplayValue('Hello world')).toBeDefined();
  });

  test('Set value', async () => {
    const onChange = vi.fn();

    setup({
      path: '',
      name: 'a',
      onChange,
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Annotation text'), {
        target: { value: 'TEST' },
      });
    });

    expect(onChange).toHaveBeenCalledWith({
      text: 'TEST',
      authorReference: {
        display: 'Alice Smith',
        reference: 'Practitioner/124',
      },
      time: expect.anything(),
    });
  });

  test('Set value without change listener', async () => {
    setup({
      path: '',
      name: 'a',
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Annotation text'), {
        target: { value: 'TEST' },
      });
    });

    expect(screen.getByDisplayValue('TEST')).toBeDefined();
  });

  test('Clear value', async () => {
    const onChange = vi.fn();

    setup({
      path: '',
      name: 'a',
      defaultValue: {
        text: 'Hello world',
        time: '2020-01-01T00:00:00Z',
      },
      onChange,
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Annotation text'), {
        target: { value: '' },
      });
    });

    expect(onChange).toHaveBeenCalledWith({});
  });
});
