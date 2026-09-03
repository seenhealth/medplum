// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/script.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)

/**
 * Dynamically creates a script tag for the specified JavaScript file.
 * @param src - The JavaScript file URL.
 * @param onload - Optional callback for the onload event.
 */
export function createScriptTag(src: string, onload?: () => void): void {
  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.onload = onload ?? null;
  head.appendChild(script);
}
