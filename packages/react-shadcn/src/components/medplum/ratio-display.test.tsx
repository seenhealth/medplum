// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RatioDisplay/RatioDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { RatioDisplay } from '@/components/medplum/ratio-display';
import { render, screen } from '@/test/render';

describe('RatioDisplay', () => {
  test('Renders', () => {
    render(<RatioDisplay value={{ numerator: { value: 5, unit: 'mg' }, denominator: { value: 10, unit: 'ml' } }} />);
    expect(screen.getByText('5 mg / 10 ml')).toBeInTheDocument();
  });

  test('Renders undefined value', () => {
    render(<RatioDisplay />);
  });

  test('Renders with precision', () => {
    render(
      <RatioDisplay
        value={{ numerator: { value: 5, unit: 'mg' }, denominator: { value: 10, unit: 'ml' } }}
        precision={2}
      />
    );
    expect(screen.getByText('5.00 mg / 10.00 ml')).toBeInTheDocument();
  });
});
