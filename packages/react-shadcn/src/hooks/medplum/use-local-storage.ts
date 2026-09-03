// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseLocalStorageOptions<T> {
  readonly key: string;
  readonly defaultValue: T;
  readonly getInitialValueInEffect?: boolean;
}

function readValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const item = window.localStorage.getItem(key);
  if (item === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function useLocalStorage<T>(
  options: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { key, defaultValue, getInitialValueInEffect = true } = options;
  const defaultValueRef = useRef(defaultValue);
  useEffect(() => {
    defaultValueRef.current = defaultValue;
  }, [defaultValue]);

  const [value, setValue] = useState<T>(() => (getInitialValueInEffect ? defaultValue : readValue(key, defaultValue)));

  useEffect(() => {
    if (getInitialValueInEffect) {
      setValue(readValue(key, defaultValueRef.current));
    }
  }, [key, getInitialValueInEffect]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        }
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    setValue(defaultValueRef.current);
  }, [key]);

  return [value, set, remove];
}
