// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useClipboard } from '@/hooks/medplum/use-clipboard';
import { act, renderHook } from '@testing-library/react';

describe('useClipboard', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('copy writes to the clipboard and sets copied to true', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('copied resets to false after the timeout', async () => {
    const { result } = renderHook(() => useClipboard({ timeout: 1000 }));

    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  test('reset clears the copied state', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
  });

  test('sets an error when the clipboard write rejects', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toEqual('denied');
  });
});
