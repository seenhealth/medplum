// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ListWithDetailPane/ListWithDetailPaneSkeleton.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { JSX } from 'react';

// Configs
const SKELETON_WIDTHS = [
  ['85%', '60%', '72%'],
  ['70%', '80%', '55%'],
  ['92%', '50%', '65%'],
  ['78%', '68%', '58%'],
  ['88%', '45%', '75%'],
  ['74%', '70%', '62%'],
];

/**
 * ListWithDetailPaneSkeleton is the default loading placeholder for the list sidebar.
 * It renders a few rows of varied-width skeleton lines separated by dividers.
 * @returns The ListWithDetailPaneSkeleton React node.
 */
export function ListWithDetailPaneSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-4">
      {SKELETON_WIDTHS.map((widths, index) => (
        <div key={index} className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <Skeleton className="h-4" style={{ width: widths[0] }} />
            <Skeleton className="h-3.5" style={{ width: widths[1] }} />
            <Skeleton className="h-3.5" style={{ width: widths[2] }} />
          </div>
          <Separator />
        </div>
      ))}
    </div>
  );
}
