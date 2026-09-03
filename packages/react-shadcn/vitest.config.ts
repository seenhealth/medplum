// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { medplumAliases } from '../../aliases.mjs';

const alias = {
  ...medplumAliases,
  '@': resolve(import.meta.dirname, 'src'),
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          environmentOptions: {
            jsdom: {
              url: 'http://localhost/',
            },
          },
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
          testTimeout: 10_000,
          pool: 'threads',
          fakeTimers: {
            shouldAdvanceTime: true,
          },
        },
      },
      {
        plugins: [storybookTest({ configDir: resolve(import.meta.dirname, '.storybook') })],
        resolve: { alias },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
