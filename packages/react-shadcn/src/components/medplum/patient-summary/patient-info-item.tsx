// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/PatientInfoItem.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Patient } from '@medplum/fhirtypes';
import type { JSX, ReactNode } from 'react';

export interface PatientInfoItemProps {
  patient: Patient;
  value: string | undefined;
  icon: ReactNode;
  placeholder: string;
  label: string;
  onClickResource?: (patient: Patient) => void;
}

export const PatientInfoItem = (props: PatientInfoItemProps): JSX.Element => {
  const { patient, value, icon, placeholder, label, onClickResource } = props;
  const displayText = value || placeholder;

  return (
    <SummaryItem
      onClick={() => {
        onClickResource?.(patient);
      }}
    >
      <div>
        <Tooltip delayDuration={650}>
          <TooltipTrigger asChild>
            <div className="mr-0.5 ml-1.5 flex min-w-0 cursor-pointer flex-nowrap items-center gap-3">
              {icon}
              <p className={`truncate text-sm font-normal ${value ? '' : 'text-muted-foreground'}`}>{displayText}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="start">
            {label}
          </TooltipContent>
        </Tooltip>
      </div>
    </SummaryItem>
  );
};
