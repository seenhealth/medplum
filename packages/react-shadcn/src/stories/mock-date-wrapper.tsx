// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/stories/MockDateWrapper.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MockDateContext, createGlobalTimer } from '@/stories/mock-date-wrapper-utils';
import type { JSX, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type sinon from 'sinon';

export function MockDateWrapper({ children }: { children: ReactNode }): JSX.Element | null {
  const [ready, setReady] = useState(false);
  const clockRef = useRef<sinon.SinonFakeTimers>(undefined);
  useEffect(() => {
    clockRef.current = createGlobalTimer();
    setReady(true);
    return () => {
      if (clockRef.current) {
        clockRef.current.restore();
      }
    };
  }, []);

  const contextValue = useMemo(() => {
    const advanceSystemTime = (seconds?: number): void => {
      if (!clockRef.current) {
        throw new Error('should not happen');
      }
      const milliseconds = (seconds ?? 60) * 1000;
      const now = new Date();
      clockRef.current.setSystemTime(new Date(now.getTime() + milliseconds));
    };
    return { advanceSystemTime };
  }, []);

  if (!ready) {
    return null;
  }

  return <MockDateContext.Provider value={contextValue}>{children}</MockDateContext.Provider>;
}
