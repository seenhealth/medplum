// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Loading/Loading.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Spinner } from '@/components/ui/spinner';
import type { JSX } from 'react';

export function Loading(): JSX.Element {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner />
    </div>
  );
}
