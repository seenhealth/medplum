// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/recaptcha.test.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { initRecaptcha } from '@/lib/medplum/recaptcha';

describe('reCAPTCHA', () => {
  beforeEach(() => {
    // Reset the DOM
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  test('initRecaptcha', () => {
    expect(document.getElementsByTagName('script').length).toBe(0);

    // Init Recaptcha
    // Should create a <script> tag for the Recaptcha script.
    initRecaptcha('xyz');
    expect(document.getElementsByTagName('script').length).toBe(1);

    // Simulate loading the script
    Object.defineProperty(global, 'grecaptcha', { value: {} });

    // Initializing again should not create more <script> tags
    initRecaptcha('xyz');
    expect(document.getElementsByTagName('script').length).toBe(1);
  });
});
