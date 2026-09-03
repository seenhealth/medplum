// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/FhirPathTable/FhirPathTable.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FhirPathDisplay } from '@/components/medplum/fhir-path-display';
import { SearchClickEvent } from '@/components/medplum/search-control/search-control';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isAuxClick, isCheckboxCell, killEvent } from '@/lib/medplum/dom';
import { normalizeOperationOutcome } from '@medplum/core';
import type { OperationOutcome, Resource } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { ChangeEvent, JSX, MouseEvent } from 'react';
import { memo, useEffect, useState } from 'react';

export interface FhirPathTableField {
  readonly propertyType: string;
  readonly name: string;
  readonly fhirPath: string;
}

export interface FhirPathTableProps {
  readonly resourceType: string;
  readonly query: string;
  readonly fields: FhirPathTableField[];
  readonly checkboxesEnabled?: boolean;
  readonly onClick?: (e: SearchClickEvent) => void;
  readonly onAuxClick?: (e: SearchClickEvent) => void;
  readonly onBulk?: (ids: string[]) => void;
}

export interface SmartSearchResponse {
  readonly data: {
    ResourceList: Resource[];
  };
}

/**
 * The FhirPathTable component represents the embeddable search table control.
 * @param props - FhirPathTable React props.
 * @returns FhirPathTable React node.
 */
export function FhirPathTable(props: FhirPathTableProps): JSX.Element {
  const medplum = useMedplum();
  const [schemaLoaded, setSchemaLoaded] = useState(false);
  const [outcome, setOutcome] = useState<OperationOutcome | undefined>();
  const { query, fields } = props;
  const [response, setResponse] = useState<SmartSearchResponse | undefined>();
  const [selected, setSelected] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    setOutcome(undefined);
    medplum
      .graphql(query)
      .then(setResponse)
      .catch((err) => setOutcome(normalizeOperationOutcome(err)));
  }, [medplum, query]);

  function handleSingleCheckboxClick(e: ChangeEvent, id: string): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const newSelected = { ...selected };
    if (checked) {
      newSelected[id] = true;
    } else {
      delete newSelected[id];
    }
    setSelected(newSelected);
  }

  function handleAllCheckboxClick(e: ChangeEvent): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const newSelected = {} as { [id: string]: boolean };
    const resources = response?.data.ResourceList;
    if (checked && resources) {
      resources.forEach((resource) => {
        if (resource.id) {
          newSelected[resource.id] = true;
        }
      });
    }
    setSelected(newSelected);
  }

  function isAllSelected(): boolean {
    const resources = response?.data.ResourceList;
    if (!resources || resources.length === 0) {
      return false;
    }
    for (const resource of resources) {
      if (resource.id && !selected[resource.id]) {
        return false;
      }
    }
    return true;
  }

  function handleRowClick(e: MouseEvent, resource: Resource): void {
    if (isCheckboxCell(e.target as Element)) {
      // Ignore clicks on checkboxes
      return;
    }

    if (e.button === 2) {
      return;
    }

    killEvent(e);

    const isAux = isAuxClick(e);
    if (!isAux && props.onClick) {
      props.onClick(new SearchClickEvent(resource, e));
    }

    if (isAux && props.onAuxClick) {
      props.onAuxClick(new SearchClickEvent(resource, e));
    }
  }

  useEffect(() => {
    medplum
      .requestSchema(props.resourceType)
      .then(() => setSchemaLoaded(true))
      .catch(console.log);
  }, [medplum, props.resourceType]);

  if (!schemaLoaded) {
    return <Spinner />;
  }

  const checkboxColumn = props.checkboxesEnabled;

  return (
    <div onContextMenu={(e) => killEvent(e)} data-testid="search-control">
      <Table>
        <TableHeader>
          <TableRow>
            {checkboxColumn && (
              <TableHead>
                <input
                  type="checkbox"
                  value="checked"
                  aria-label="all-checkbox"
                  data-testid="all-checkbox"
                  checked={isAllSelected()}
                  onChange={(e) => handleAllCheckboxClick(e)}
                />
              </TableHead>
            )}
            {fields.map((field) => (
              <TableHead key={field.name}>{field.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {response?.data.ResourceList.map(
            (resource) =>
              resource && (
                <TableRow
                  key={resource.id}
                  data-testid="search-control-row"
                  onClick={(e) => handleRowClick(e, resource)}
                  onAuxClick={(e) => handleRowClick(e, resource)}
                >
                  {checkboxColumn && (
                    <TableCell>
                      <input
                        type="checkbox"
                        value="checked"
                        data-testid="row-checkbox"
                        aria-label={`Checkbox for ${resource.id}`}
                        checked={!!selected[resource.id as string]}
                        onChange={(e) => handleSingleCheckboxClick(e, resource.id as string)}
                      />
                    </TableCell>
                  )}
                  {fields.map((field) => {
                    return (
                      <TableCell key={field.name}>
                        <FhirPathDisplay propertyType={field.propertyType} path={field.fhirPath} resource={resource} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
      {response?.data.ResourceList.length === 0 && <div data-testid="empty-search">No results</div>}
      {outcome && (
        <div data-testid="search-error">
          <pre style={{ textAlign: 'left' }}>{JSON.stringify(outcome, undefined, 2)}</pre>
        </div>
      )}
      {props.onBulk && (
        <Button onClick={() => (props.onBulk as (ids: string[]) => any)(Object.keys(selected))}>Bulk...</Button>
      )}
    </div>
  );
}

export const MemoizedFhirPathTable = memo(FhirPathTable);
