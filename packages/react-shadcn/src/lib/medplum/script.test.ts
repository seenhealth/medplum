// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/script.test.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { createScriptTag } from '@/lib/medplum/script';

describe('Script Utils', () => {
  beforeEach(() => {
    // Reset the DOM
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  test('createScriptTag', () => {
    expect(document.getElementsByTagName('script').length).toBe(0);
    createScriptTag('test.js');
    expect(document.getElementsByTagName('script').length).toBe(1);
  });
});
