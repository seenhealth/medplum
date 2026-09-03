// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ScrollToTop/ScrollToTop.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ScrollToTop } from '@/components/medplum/scroll-to-top';
import { act, fireEvent, render } from '@/test/render';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import type { Mock } from 'vitest';

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  test('scrolls to top on route change', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/initial']}>
        <Routes>
          <Route path="*" element={<ScrollToTop />} />
        </Routes>
        <Link to="/new-route">Navigate</Link>
      </MemoryRouter>
    );

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    // Clear mock calls
    (window.scrollTo as Mock).mockClear();

    // Simulate navigation
    await act(() => fireEvent.click(container.querySelector('a') as HTMLAnchorElement));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
