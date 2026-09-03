// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentInput/AttachmentInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { AttachmentInputProps } from '@/components/medplum/attachment-input';
import { AttachmentInput } from '@/components/medplum/attachment-input';
import { act, fireEvent, render, screen } from '@/test/render';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

function setup(args?: AttachmentInputProps): void {
  render(
    <MedplumProvider medplum={medplum}>
      <AttachmentInput path="" name="test" {...args} />
    </MedplumProvider>
  );
}

describe('AttachmentInput', () => {
  beforeAll(async () => {
    global.URL.createObjectURL = vi.fn(() => 'details');
  });

  test('Renders', () => {
    setup();
  });

  test('Renders attachments', async () => {
    await act(async () => {
      await setup({
        path: '',
        name: 'test',
        defaultValue: {
          contentType: 'image/jpeg',
          url: 'https://example.com/test.jpg',
          title: 'test.jpg',
        },
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
        path: '',
        name: 'test',
        defaultValue: {
          contentType: 'image/jpeg',
          url: 'https://example.com/test.jpg',
          title: 'test.jpg',
        },
      });
    });

    expect(await screen.findByAltText('test.jpg')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Remove'));
    });

    expect(screen.queryByText('image/jpeg')).toBeNull();
  });

  test('Calls onChange', async () => {
    const onChange = vi.fn();

    setup({
      path: '',
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
