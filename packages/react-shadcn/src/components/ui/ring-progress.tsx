// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { cn } from '@/lib/utils';
import type { JSX, ReactNode } from 'react';

export interface RingProgressSection {
  readonly value: number;
  readonly color?: string;
  readonly tooltip?: ReactNode;
}

export interface RingProgressProps {
  readonly sections: RingProgressSection[];
  readonly size?: number;
  readonly thickness?: number;
  readonly roundCaps?: boolean;
  readonly label?: ReactNode;
  readonly className?: string;
}

function sectionStrokeProps(color: string | undefined): { className?: string; stroke?: string } {
  if (!color) {
    return { className: 'stroke-current text-primary' };
  }
  if (color.startsWith('text-')) {
    return { className: cn('stroke-current', color) };
  }
  return { stroke: color };
}

export function RingProgress({
  sections,
  size = 120,
  thickness = 12,
  roundCaps = false,
  label,
  className,
}: RingProgressProps): JSX.Element {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div
      data-slot="ring-progress"
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={thickness} className="stroke-muted" />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {sections.map((section, index) => {
            const arcLength = (section.value / 100) * circumference;
            const offset = cumulative;
            cumulative += arcLength;
            return (
              <circle
                key={index}
                data-slot="ring-progress-section"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                strokeDashoffset={-offset}
                strokeLinecap={roundCaps ? 'round' : 'butt'}
                {...sectionStrokeProps(section.color)}
              >
                {section.tooltip && <title>{section.tooltip}</title>}
              </circle>
            );
          })}
        </g>
      </svg>
      {label && (
        <div data-slot="ring-progress-label" className="absolute inset-0 flex items-center justify-center">
          {label}
        </div>
      )}
    </div>
  );
}
