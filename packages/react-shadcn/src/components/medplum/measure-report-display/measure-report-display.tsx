// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MeasureReportDisplay/MeasureReportDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import {
  MeasureReportGroupDisplay,
  MeasureTitle,
} from '@/components/medplum/measure-report-display/measure-report-group-display';
import type { MeasureReport, MeasureReportGroup, Reference } from '@medplum/fhirtypes';
import { useResource, useSearchOne } from '@medplum/react-hooks';
import type { JSX } from 'react';

export interface MeasureReportDisplayProps {
  readonly measureReport: MeasureReport | Reference<MeasureReport>;
}

export function MeasureReportDisplay(props: MeasureReportDisplayProps): JSX.Element | null {
  const report = useResource(props.measureReport);
  const [measure] = useSearchOne('Measure', { url: report?.measure });

  if (!report) {
    return null;
  }

  return (
    <div>
      {measure && <MeasureTitle measure={measure} />}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-1 sm:gap-3">
        {report.group?.map((group: MeasureReportGroup, idx: number) => (
          <MeasureReportGroupDisplay key={group.id ?? idx} group={group} />
        ))}
      </div>
    </div>
  );
}
