// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentArrayInput/AttachmentArrayInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { AttachmentArrayInputProps } from '@/components/medplum/attachment-array-input';
import { AttachmentArrayInput } from '@/components/medplum/attachment-array-input';
import { act, fireEvent, render, screen } from '@/test/render';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

function setup(args?: AttachmentArrayInputProps): void {
  render(
    <MedplumProvider medplum={medplum}>
      <AttachmentArrayInput name="test" {...args} />
    </MedplumProvider>
  );
}

describe('AttachmentArrayInput', () => {
  beforeAll(async () => {
    global.URL.createObjectURL = vi.fn(() => 'details');
  });

  test('Renders', () => {
    setup();
  });

  test('Renders empty array', () => {
    setup({
      name: 'test',
      defaultValue: [],
    });
  });

  test('Renders attachments', async () => {
    await act(async () => {
      await setup({
        name: 'test',
        defaultValue: [
          {
            contentType: 'image/jpeg',
            url: 'https://example.com/test.jpg',
            title: 'test.jpg',
          },
        ],
      });
    });

    expect(await screen.findByAltText('test.jpg')).toBeInTheDocument();
  });

  test('Add attachment', async () => {
    setup();

    await act(async () => {
      const files = [new File(['hello'], 'hello.txt', { type: 'text/plain' })];
      fireEvent.change(screen.getByTestId('upload-file-input'), {
        target: { files },
      });
    });

    expect(screen.getByText('hello.txt')).toBeInTheDocument();
  });

  test('Remove attachment', async () => {
    await act(async () => {
      await setup({
        name: 'test',
        defaultValue: [
          {
            contentType: 'image/jpeg',
            url: 'https://example.com/test.jpg',
            title: 'test.jpg',
          },
        ],
      });
    });

    await act(async () => {
      expect(await screen.findByAltText('test.jpg')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTitle('Remove'));
    });

    expect(screen.queryByText('image/jpeg')).toBeNull();
  });

  test('Calls onChange', async () => {
    const onChange = vi.fn();

    setup({
      name: 'test',
      onChange,
    });

    await act(async () => {
      const files = [new File(['hello'], 'hello.txt', { type: 'text/plain' })];
      fireEvent.change(screen.getByTestId('upload-file-input'), {
        target: { files },
      });
    });

    expect(onChange).toHaveBeenCalled();
  });
});
