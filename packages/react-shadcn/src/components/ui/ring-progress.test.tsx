// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { RingProgress } from '@/components/ui/ring-progress';
import { render, screen } from '@/test/render';

describe('RingProgress', () => {
  test('renders an svg with a track circle and one circle per section', () => {
    const { container } = render(
      <RingProgress
        sections={[
          { value: 40, color: 'text-primary' },
          { value: 20, color: 'text-destructive' },
        ]}
      />
    );

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('[data-slot="ring-progress-section"]')).toHaveLength(2);
  });

  test('renders the label', () => {
    render(<RingProgress sections={[{ value: 75 }]} label="75%" />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('applies raw CSS colors directly via the stroke attribute', () => {
    const { container } = render(<RingProgress sections={[{ value: 50, color: '#16a34a' }]} />);

    const section = container.querySelector('[data-slot="ring-progress-section"]');
    expect(section).toHaveAttribute('stroke', '#16a34a');
  });

  test('applies tailwind text-color classes via stroke-current', () => {
    const { container } = render(<RingProgress sections={[{ value: 50, color: 'text-destructive' }]} />);

    const section = container.querySelector('[data-slot="ring-progress-section"]');
    expect(section).toHaveClass('stroke-current', 'text-destructive');
    expect(section).not.toHaveAttribute('stroke');
  });

  test('defaults to roundCaps off and honors size and thickness', () => {
    const { container } = render(<RingProgress sections={[{ value: 30 }]} size={80} thickness={8} roundCaps />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');

    const section = container.querySelector('[data-slot="ring-progress-section"]');
    expect(section).toHaveAttribute('stroke-linecap', 'round');
  });
});
