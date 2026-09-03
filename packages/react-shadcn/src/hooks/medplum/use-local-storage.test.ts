// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useLocalStorage } from '@/hooks/medplum/use-local-storage';
import { act, renderHook } from '@testing-library/react';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('reads the stored value on mount', () => {
    window.localStorage.setItem('medplum.test', JSON.stringify({ a: 1 }));

    const { result } = renderHook(() => useLocalStorage({ key: 'medplum.test', defaultValue: {} }));

    expect(result.current[0]).toEqual({ a: 1 });
  });

  test('falls back to the default value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage({ key: 'medplum.missing', defaultValue: { count: 0 } }));

    expect(result.current[0]).toEqual({ count: 0 });
  });

  test('reads from storage synchronously when getInitialValueInEffect is false', () => {
    window.localStorage.setItem('medplum.test', JSON.stringify({ a: 1 }));

    const { result } = renderHook(() =>
      useLocalStorage({ key: 'medplum.test', defaultValue: {}, getInitialValueInEffect: false })
    );

    expect(result.current[0]).toEqual({ a: 1 });
  });

  test('setValue writes the serialized value to storage', () => {
    const { result } = renderHook(() => useLocalStorage({ key: 'medplum.test', defaultValue: 0 }));

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(window.localStorage.getItem('medplum.test')).toEqual('5');
  });

  test('setValue accepts an updater function', () => {
    const { result } = renderHook(() => useLocalStorage({ key: 'medplum.test', defaultValue: 1 }));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  test('removeValue resets to the default and clears storage', () => {
    const { result } = renderHook(() => useLocalStorage({ key: 'medplum.test', defaultValue: 0 }));

    act(() => {
      result.current[1](5);
    });
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(0);
    expect(window.localStorage.getItem('medplum.test')).toBeNull();
  });
});
