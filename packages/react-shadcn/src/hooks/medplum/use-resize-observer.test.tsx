// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useResizeObserver } from '@/hooks/medplum/use-resize-observer';
import { render } from '@/test/render';
import { renderHook } from '@testing-library/react';
import type { JSX } from 'react';

// jsdom has no ResizeObserver; src/test/setup.ts stubs it with a no-op observe/unobserve/disconnect,
// so the callback never fires. These tests assert the shape the hook returns, not live resize updates.
describe('useResizeObserver', () => {
  test('returns a ref and a zeroed rect before anything observes', () => {
    const { result } = renderHook(() => useResizeObserver<HTMLDivElement>());
    const [ref, rect] = result.current;

    expect(ref.current).toBeNull();
    expect(rect).toEqual({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 });
  });

  test('attaches the ref to a rendered element', () => {
    function TestComponent(): JSX.Element {
      const [ref] = useResizeObserver<HTMLDivElement>();
      return <div ref={ref} data-testid="observed" />;
    }

    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('observed')).toBeInTheDocument();
  });
});
