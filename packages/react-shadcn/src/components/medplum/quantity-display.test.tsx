// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuantityDisplay/QuantityDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { QuantityDisplay } from '@/components/medplum/quantity-display';
import { render, screen } from '@/test/render';

describe('QuantityDisplay', () => {
  test('Renders', () => {
    render(<QuantityDisplay value={{ value: 1, unit: 'mg' }} />);
    expect(screen.getByText('1 mg')).toBeInTheDocument();
  });

  test('Renders undefined value', () => {
    render(<QuantityDisplay />);
  });

  test('Renders comparator', () => {
    render(<QuantityDisplay value={{ comparator: '<', value: 1, unit: 'mg' }} />);
    expect(screen.getByText('< 1 mg')).toBeInTheDocument();
  });

  test('Missing value', () => {
    render(<QuantityDisplay value={{ unit: 'mg' }} />);
    expect(screen.getByText('mg')).toBeInTheDocument();
  });

  test('Missing unit', () => {
    render(<QuantityDisplay value={{ value: 123 }} />);
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  test('Percent spacing', () => {
    render(<QuantityDisplay value={{ value: 50, unit: '%' }} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('Renders with precision', () => {
    render(<QuantityDisplay value={{ value: 1.5, unit: 'mg' }} precision={2} />);
    expect(screen.getByText('1.50 mg')).toBeInTheDocument();
  });
});
