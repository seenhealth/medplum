// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentDisplay/ScannedImage.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)

import { ScannedImage } from '@/components/medplum/attachment-display/scanned-image';
import { act, fireEvent, render, screen } from '@/test/render';

describe('ScannedImage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('retries after an image load error', () => {
    render(<ScannedImage alt="Scanned document" src="https://example.com/image.jpg" />);

    fireEvent.error(screen.getByAltText('Scanned document'));

    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByAltText('Scanned document')).toBeInTheDocument();
  });

  test('shows a placeholder after the final retry fails', () => {
    render(<ScannedImage alt="Scanned document" src="https://example.com/image.jpg" maxRetries={1} />);

    fireEvent.error(screen.getByAltText('Scanned document'));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    fireEvent.error(screen.getByAltText('Scanned document'));

    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  test('clears the retry timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = render(<ScannedImage alt="Scanned document" src="https://example.com/image.jpg" />);

    fireEvent.error(screen.getByAltText('Scanned document'));
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
