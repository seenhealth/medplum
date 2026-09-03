// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/loadState.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)

/**
 * Common state for async loading operations
 * @example
 * const [state, setState] = useState<LoadState>('loading');
 * if (state === 'loading') { return <Loader />; }
 * if (state === 'error') { return <ErrorMessage />; }
 * return <Data />;
 */
export type LoadState = 'loading' | 'loaded' | 'error';
