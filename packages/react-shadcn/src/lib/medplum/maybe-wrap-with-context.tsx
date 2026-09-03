// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/maybeWrapWithContext.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { Context, JSX } from 'react';

export function maybeWrapWithContext<T>(
  ContextProvider: Context<T>['Provider'],
  contextValue: T | undefined,
  contents: JSX.Element
): JSX.Element {
  if (contextValue !== undefined) {
    return <ContextProvider value={contextValue}>{contents}</ContextProvider>;
  }

  return contents;
}
