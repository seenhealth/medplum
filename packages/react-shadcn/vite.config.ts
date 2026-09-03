// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { medplumAliases } from '../../aliases.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      ...medplumAliases,
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
});
