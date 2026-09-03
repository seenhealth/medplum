// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceAvatar/ResourceAvatar.utils.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
export function getInitials(input: string): string {
  const words = input.split(' ').filter(Boolean);
  if (words.length > 1) {
    return words[0][0] + words.at(-1)?.at(0);
  }
  if (words.length === 1) {
    return words[0][0];
  }
  return '';
}
