// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/stories/MockDateWrapper.utils.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { createContext } from 'react';
import type { SinonFakeTimers } from 'sinon';
import { useFakeTimers } from 'sinon';

export type MockDateContextType = {
  advanceSystemTime: (seconds?: number) => void;
};

// cast undefined so that attempting to use this context without the withMockedDate decorator will crash
export const MockDateContext = createContext(undefined as unknown as MockDateContextType);

export const DEFAULT_MOCKED_DATE = new Date(2020, 4, 4, 12, 5);

export function createGlobalTimer(): SinonFakeTimers {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFakeTimers({
    now: DEFAULT_MOCKED_DATE,
    shouldAdvanceTime: false,
    toFake: ['Date'],
  });
}
