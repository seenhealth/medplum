// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Loading/Loading.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Loading } from '@/components/medplum/loading';
import { render } from '@/test/render';

describe('Loading', () => {
  test('Renders', () => {
    const { container } = render(<Loading />);
    expect(container).toBeDefined();
    expect(container.querySelector('[class*="Loader"]')).toBeDefined();
  });
});
