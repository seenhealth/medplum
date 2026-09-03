// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/utils/maybeWrapWithTooltip.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { JSX } from 'react';

export const READ_ONLY_TOOLTIP_TEXT = 'Read Only';

export function maybeWrapWithTooltip(tooltipText: string | undefined, children: JSX.Element): JSX.Element {
  return tooltipText ? (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  ) : (
    children
  );
}
