// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';
import type { JSX, ReactNode } from 'react';
import { useEffect } from 'react';
import { addons } from 'storybook/preview-api';

// Mirrors the dark-mode addon toggle onto the `.dark` class that the shadcn tokens key off.
export function ColorSchemeWrapper({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    const channel = addons.getChannel();
    const handleDarkMode = (darkMode: boolean): void => {
      document.documentElement.classList.toggle('dark', darkMode);
    };
    channel.on(DARK_MODE_EVENT_NAME, handleDarkMode);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleDarkMode);
  }, []);
  return <>{children}</>;
}
