// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientTimeline/PatientTimeline.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { PatientTimelineProps } from '@/components/medplum/patient-timeline';
import { PatientTimeline } from '@/components/medplum/patient-timeline';
import { act, fireEvent, render, screen, waitFor } from '@/test/render';
import { createReference } from '@medplum/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

describe('PatientTimeline', () => {
  async function setup(args: PatientTimelineProps): Promise<void> {
    await act(async () => {
      render(
        <MedplumProvider medplum={medplum}>
          <PatientTimeline {...args} />
        </MedplumProvider>
      );
    });
  }

  test('Renders reference', async () => {
    await setup({ patient: createReference(HomerSimpson) });

    await waitFor(() => screen.getAllByTestId('timeline-item'));

    const items = screen.getAllByTestId('timeline-item');
    expect(items).toBeDefined();
    expect(screen.getByText('SERVICE_REQUEST_CODE')).toBeInTheDocument();
  });

  test('Renders resource', async () => {
    await setup({ patient: HomerSimpson });

    await waitFor(() => screen.getAllByTestId('timeline-item'));

    const items = screen.getAllByTestId('timeline-item');
    expect(items).toBeDefined();
    expect(screen.getByText('SERVICE_REQUEST_CODE')).toBeInTheDocument();
  });

  test('Create comment', async () => {
    await setup({ patient: HomerSimpson });

    // Wait for initial load
    await waitFor(() => screen.getAllByTestId('timeline-item'));

    // Enter the comment text
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Add comment'), {
        target: { value: 'Test comment' },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByTestId('timeline-form'), {
        target: { text: 'Test comment' },
      });
    });

    // Wait for new comment
    await waitFor(() => screen.getAllByTestId('timeline-item'));

    const items = screen.getAllByTestId('timeline-item');
    expect(items).toBeDefined();
  });

  test('Upload media', async () => {
    await setup({ patient: HomerSimpson });

    // Wait for initial load
    await waitFor(() => screen.getAllByTestId('timeline-item'));

    // Upload the file
    await act(async () => {
      const files = [new File(['hello'], 'hello.txt', { type: 'text/plain' })];
      fireEvent.change(screen.getByTestId('upload-file-input'), {
        target: { files },
      });
    });

    // Wait for new media
    await waitFor(() => screen.getAllByTestId('timeline-item'));

    const items = screen.getAllByTestId('timeline-item');
    expect(items).toBeDefined();
  });
});
