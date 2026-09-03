// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/test-utils/render.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
// Upstream wrapped every test in MantineProvider; shadcn needs only TooltipProvider (Radix) and the sonner Toaster.
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { RenderResult } from '@testing-library/react';
import { act, fireEvent, screen, render as testingLibraryRender, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSX, ReactNode } from 'react';

export { clickAutocompleteOption, selectAutocompleteOption, typeInAutocomplete } from '@/test/async-autocomplete';
export { act, fireEvent, screen, userEvent, waitFor, within };

export function render(ui: ReactNode, wrapper?: ({ children }: { children: ReactNode }) => JSX.Element): RenderResult {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TooltipProvider>
        {wrapper ? wrapper({ children }) : children}
        <Toaster />
      </TooltipProvider>
    ),
  });
}
