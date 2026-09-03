// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceHistoryTable/ResourceHistoryTable.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MedplumLink } from '@/components/medplum/medplum-link';
import { ResourceBadge } from '@/components/medplum/resource-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, normalizeErrorString } from '@medplum/core';
import type { Bundle, BundleEntry, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

export interface ResourceHistoryTableProps {
  readonly history?: Bundle;
  readonly resourceType?: string;
  readonly id?: string;
}

export function ResourceHistoryTable(props: ResourceHistoryTableProps): JSX.Element {
  const medplum = useMedplum();
  const [value, setValue] = useState(props.history);

  useEffect(() => {
    if (!props.history && props.resourceType && props.id) {
      medplum
        .readHistory(props.resourceType as ResourceType, props.id)
        .then(setValue)
        .catch(console.log);
    }
  }, [medplum, props.history, props.resourceType, props.id]);

  if (!value) {
    return <div>Loading...</div>;
  }

  return (
    <Table className="border-collapse border border-border [&_th]:border [&_td]:border [&_th]:border-border [&_td]:border-border">
      <TableHeader>
        <TableRow>
          <TableHead>Author</TableHead>
          <TableHead>On Behalf Of</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Version</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {value.entry?.map((entry, index) => (
          <HistoryRow key={'entry-' + index} entry={entry} />
        ))}
      </TableBody>
    </Table>
  );
}

interface HistoryRowProps {
  readonly entry: BundleEntry;
}

function HistoryRow(props: HistoryRowProps): JSX.Element {
  const { response, resource } = props.entry;
  if (resource) {
    return (
      <TableRow>
        <TableCell>
          <ResourceBadge value={resource.meta?.author} link={true} />
        </TableCell>
        <TableCell>
          {resource.meta?.onBehalfOf && <ResourceBadge value={resource.meta.onBehalfOf} link={true} />}
        </TableCell>
        <TableCell>{formatDateTime(resource.meta?.lastUpdated)}</TableCell>
        <TableCell>
          <MedplumLink to={getVersionUrl(resource)}>{resource.meta?.versionId}</MedplumLink>
        </TableCell>
      </TableRow>
    );
  } else {
    return (
      <TableRow>
        <TableCell colSpan={4}>{normalizeErrorString(response?.outcome)}</TableCell>
      </TableRow>
    );
  }
}

function getVersionUrl(resource: Resource): string {
  return `/${resource.resourceType}/${resource.id}/_history/${resource.meta?.versionId}`;
}
