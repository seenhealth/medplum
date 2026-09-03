// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

export interface ResizeObserverRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
  readonly bottom: number;
  readonly right: number;
}

const DEFAULT_RECT: ResizeObserverRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

export function useResizeObserver<T extends HTMLElement>(): [RefObject<T | null>, ResizeObserverRect] {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<ResizeObserverRect>(DEFAULT_RECT);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => setRect(entry.contentRect));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, rect];
}
