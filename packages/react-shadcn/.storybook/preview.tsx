// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/storybook/.storybook/preview.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/styles.css';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import type { Decorator, Preview } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router';
import * as sinon from 'sinon';
import { ColorSchemeWrapper } from './ColorSchemeWrapper';

// wrap initialization of MockClient and initial page navigation
// so that resources created in MockFetchClient#initMockRepo have
// consistent timestamps between storybook runs
const clock = sinon.useFakeTimers({
  now: new Date(2020, 4, 4, 12, 5),
  toFake: ['Date'],
});
const medplum = new MockClient();
medplum
  .get('/')
  .then(() => clock.restore())
  .catch(() => clock.restore());

const decorators: Decorator[] = [
  (Story, ctx) => (
    <BrowserRouter>
      <MedplumProvider
        medplum={ctx.parameters.skipDefaultSeeding ? new MockClient({ seedDefaultData: false }) : medplum}
      >
        <Story />
      </MedplumProvider>
    </BrowserRouter>
  ),
  (Story) => (
    <ColorSchemeWrapper>
      <TooltipProvider>
        <Story />
        <Toaster />
      </TooltipProvider>
    </ColorSchemeWrapper>
  ),
];

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      codePanel: true,
    },
  },
  decorators,
};

export default preview;
