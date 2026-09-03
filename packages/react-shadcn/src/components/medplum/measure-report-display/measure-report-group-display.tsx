// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MeasureReportDisplay/MeasureReportGroupDisplay/MeasureReportGroupDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { QuantityDisplay } from '@/components/medplum/quantity-display';
import { RingProgress } from '@/components/ui/ring-progress';
import { formatCodeableConcept } from '@medplum/core';
import type { Measure, MeasureReportGroup } from '@medplum/fhirtypes';
import type { JSX } from 'react';

interface MeasureReportGroupDisplayProps {
  readonly group: MeasureReportGroup;
}

interface MeasureProps {
  readonly measure: Measure;
}

export function MeasureReportGroupDisplay(props: MeasureReportGroupDisplayProps): JSX.Element | null {
  const { group } = props;
  return (
    <div className="flex items-center justify-center rounded-md border bg-card p-2">
      <div className="flex items-center gap-4">
        {group.measureScore && <MeasureScore group={group} />}
        {!group.measureScore && <MeasureReportPopulation group={group} />}
      </div>
    </div>
  );
}

export function MeasureTitle(props: MeasureProps): JSX.Element {
  const { measure } = props;
  return (
    <>
      <p className="mb-2 text-base font-medium">{measure.title}</p>
      <p className="mb-2 text-xs text-muted-foreground">{measure.subtitle}</p>
    </>
  );
}

function MeasureReportPopulation(props: MeasureReportGroupDisplayProps): JSX.Element {
  const { group } = props;
  const populations = group.population;
  const numerator = populations?.find((p: any) => formatCodeableConcept(p.code) === 'numerator');
  const denominator = populations?.find((p: any) => formatCodeableConcept(p.code) === 'denominator');

  const numeratorCount = numerator?.count;
  const denominatorCount = denominator?.count;

  if (denominatorCount === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold">Not Applicable</h3>
        <p>{`Denominator: ${denominatorCount}`}</p>
      </div>
    );
  }

  if (numeratorCount === undefined || denominatorCount === undefined) {
    return (
      <div>
        <h3 className="text-lg font-semibold">Insufficient Data</h3>
        <p>{`Numerator: ${numeratorCount}`}</p>
        <p>{`Denominator: ${denominatorCount}`}</p>
      </div>
    );
  }

  const value = (numeratorCount / denominatorCount) * 100;
  return (
    <RingProgress
      size={120}
      thickness={12}
      roundCaps
      sections={[{ value: value, color: groupColor(value) }]}
      label={
        <p className="text-lg font-bold">
          {numeratorCount} / {denominatorCount}
        </p>
      }
    />
  );
}

function MeasureScore(props: MeasureReportGroupDisplayProps): JSX.Element {
  const { group } = props;
  const unit = group.measureScore?.unit ?? group.measureScore?.code;

  return (
    <>
      {unit === '%' ? (
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[{ value: groupValue(group), color: groupColor(group?.measureScore?.value ?? 0) }]}
          label={
            <p className="text-lg font-bold">
              <QuantityDisplay value={group.measureScore} />
            </p>
          }
        />
      ) : (
        <div className="flex h-[120px] items-center">
          <h3 className="text-lg font-semibold">
            <QuantityDisplay value={group.measureScore} />
          </h3>
        </div>
      )}
    </>
  );
}

function groupValue(group: MeasureReportGroup): number {
  const score = group.measureScore?.value;
  const unit = group.measureScore?.unit;
  if (!score) {
    return 0;
  }
  if (score <= 1 && unit === '%') {
    return score * 100;
  }
  return score;
}

function groupColor(score: number): string {
  if (score <= 33) {
    return 'red';
  }
  if (score <= 67) {
    return 'yellow';
  }
  return 'green';
}
