// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useCallback, useRef, useState } from 'react';

export interface UseClipboardOptions {
  readonly timeout?: number;
}

export interface UseClipboardReturn {
  readonly copy: (value: string) => void;
  readonly copied: boolean;
  readonly reset: () => void;
  readonly error: Error | null;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reset = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setCopied(false);
    setError(null);
  }, []);

  const copy = useCallback(
    (value: string) => {
      if (!navigator.clipboard) {
        setError(new Error('useClipboard: navigator.clipboard is not supported'));
        return;
      }
      navigator.clipboard
        .writeText(value)
        .then(() => {
          clearTimeout(timeoutRef.current);
          setCopied(true);
          setError(null);
          timeoutRef.current = setTimeout(() => setCopied(false), timeout);
        })
        .catch((err: unknown) => setError(err instanceof Error ? err : new Error(String(err))));
    },
    [timeout]
  );

  return { copy, copied, reset, error };
}
