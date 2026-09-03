// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Insurance.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { formatDate } from '@medplum/core';
import type { Coverage, Organization, Reference } from '@medplum/fhirtypes';
import { useResource } from '@medplum/react-hooks';
import type { JSX } from 'react';

export interface CoverageItemProps {
  readonly coverage: Coverage | Reference<Coverage>;
  readonly organization?: Organization | Reference<Organization>;
  readonly onClickResource?: (resource: Coverage) => void;
}

export function CoverageItem(props: CoverageItemProps): JSX.Element {
  const { coverage, organization, onClickResource } = props;
  const coverageResource = useResource(coverage);
  const organizationResource = useResource(organization);
  let payorName = 'Unknown Payor';
  if (organizationResource) {
    if ('name' in organizationResource && typeof organizationResource.name === 'string') {
      payorName = organizationResource.name;
    }
  }

  const detailsText = `ID: ${coverageResource?.subscriberId ?? 'N/A'}${
    formatClassInfo(coverageResource) ? ` · ${formatClassInfo(coverageResource)}` : ''
  }`;

  return (
    <SummaryItem
      onClick={() => {
        if (coverageResource) {
          onClickResource?.(coverageResource);
        }
      }}
    >
      <div>
        <p className="truncate overflow-hidden font-medium whitespace-nowrap">{payorName}</p>
        <p className="truncate overflow-hidden font-medium whitespace-nowrap">{detailsText}</p>
        <div className="mt-0.5 flex items-center gap-1">
          <StatusBadge status="Active" />
          <p className="text-xs font-medium text-muted-foreground">Ends {formatDate(coverageResource?.period?.end)}</p>
        </div>
      </div>
    </SummaryItem>
  );
}

export interface InsuranceProps {
  readonly coverages: Coverage[];
  readonly onClickResource?: (resource: Coverage) => void;
}

export function Insurance(props: InsuranceProps): JSX.Element {
  const { coverages, onClickResource } = props;

  const activeCoverages = coverages.filter(
    (coverage) => coverage.status === 'active' && !coverage.type?.coding?.some((coding) => coding.code === 'SELFPAY')
  );

  return (
    <CollapsibleSection title="Insurance">
      {activeCoverages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {activeCoverages.map((coverage) => (
            <CoverageItem
              key={coverage.id}
              coverage={coverage}
              organization={coverage.payor?.[0] as Reference<Organization>}
              onClickResource={onClickResource}
            />
          ))}
        </div>
      ) : (
        <p>(none)</p>
      )}
    </CollapsibleSection>
  );
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatClassInfo(coverage: Coverage | undefined): string {
  if (!coverage) {
    return '';
  }
  const classInfo = coverage.class
    ?.filter((cls) => cls.type?.coding?.[0]?.code !== 'plan')
    .map((cls) => {
      const type = cls.type?.coding?.[0]?.code ?? '';
      return `${capitalizeWords(type)}: ${cls.value}`;
    })
    .join(' · ');
  return classInfo ?? '';
}
