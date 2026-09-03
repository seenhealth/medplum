// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Logo/Logo.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Logo } from '@/components/medplum/logo';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/Logo',
  component: Logo,
} as Meta;

export const Basic = (): JSX.Element => <Logo size={200} />;
