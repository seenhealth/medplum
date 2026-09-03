// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/stories/decorators.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MockDateWrapper } from '@/stories/mock-date-wrapper';
import type { Decorator } from '@storybook/react';

export const withMockedDate: Decorator = (Story) => {
  return (
    <MockDateWrapper>
      <Story />
    </MockDateWrapper>
  );
};
