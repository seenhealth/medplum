// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/app.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)

/**
 * Returns the application name from environment variables or a default value.
 * @returns The application name.
 */
export function getAppName(): string {
  return import.meta.env.MEDPLUM_APP_NAME || 'Medplum';
}
