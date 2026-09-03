// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ScrollToTop/ScrollToTop.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Component that scrolls the window to the top when the route changes.
 * This is useful for maintaining a good user experience when navigating between pages.
 * @returns Empty JSX fragment as this is a utility component with no visual representation
 */
export function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
