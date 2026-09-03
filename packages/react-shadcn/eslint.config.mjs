// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { medplumEslintConfig } from '@medplum/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  medplumEslintConfig,
  {
    // Vendored shadcn/ui primitives (MIT, installed by `shadcn add`) are never hand-edited, so the repo's
    // header and style rules do not apply to them.
    ignores: [
      'eslint.config.mjs',
      'public/**',
      'storybook-static/**',
      'artifacts/**',
      'src/components/ui/**',
      'src/hooks/use-mobile.ts',
    ],
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  }
);
