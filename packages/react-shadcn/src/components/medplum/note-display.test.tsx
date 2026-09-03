// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/NoteDisplay/NoteDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { NoteDisplayProps } from '@/components/medplum/note-display';
import { NoteDisplay } from '@/components/medplum/note-display';
import { act, render, screen } from '@/test/render';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

describe('NoteDisplay', () => {
  function setup(args: NoteDisplayProps): void {
    render(
      <MedplumProvider medplum={medplum}>
        <NoteDisplay {...args} />
      </MedplumProvider>
    );
  }

  test('Renders array', async () => {
    await act(async () => {
      setup({ value: [{ text: 'Hello World' }, { text: 'Goodbye Moon' }] });
    });

    expect(screen.getByText('Hello World')).toBeDefined();
    expect(screen.getByText('Goodbye Moon')).toBeDefined();
  });

  test('Renders author by reference', async () => {
    await act(async () => {
      setup({
        value: [{ text: 'Hello World', authorReference: { display: 'Medplum Bots' } }],
      });
    });

    expect(screen.getByText('Medplum Bots')).toBeDefined();
  });

  test('Renders author by value', async () => {
    await act(async () => {
      setup({
        value: [{ text: 'Hello World', authorString: 'Medplum Bots' }],
      });
    });

    expect(screen.getByText('Medplum Bots')).toBeDefined();
  });

  test('Returns null if value is undefined', async () => {
    await act(async () => {
      setup({ value: undefined });
    });

    expect(screen.queryByRole('blockquote')).toBeNull();
  });
});
