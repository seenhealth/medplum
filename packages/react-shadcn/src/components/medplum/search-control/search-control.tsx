// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchControl/SearchControl.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Container } from '@/components/medplum/container';
import { OperationOutcomeAlert } from '@/components/medplum/operation-outcome-alert';
import { getFieldDefinitions } from '@/components/medplum/search-control/search-control-field';
import {
  addFilter,
  buildFieldNameString,
  getOpString,
  renderValue,
  setPage,
} from '@/components/medplum/search-control/search-utils';
import { SearchExportDialog } from '@/components/medplum/search-export-dialog';
import { SearchFieldEditor } from '@/components/medplum/search-field-editor';
import { SearchFilterEditor } from '@/components/medplum/search-filter-editor';
import { SearchFilterValueDialog } from '@/components/medplum/search-filter-value-dialog';
import { SearchFilterValueDisplay } from '@/components/medplum/search-filter-value-display';
import { SearchPopupMenu } from '@/components/medplum/search-popup-menu';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isAuxClick, isCheckboxCell, killEvent } from '@/lib/medplum/dom';
import { getPaginationControlProps } from '@/lib/medplum/pagination';
import type { Filter, SearchRequest } from '@medplum/core';
import {
  DEFAULT_SEARCH_COUNT,
  deepEquals,
  formatSearchQuery,
  isDataTypeLoaded,
  normalizeOperationOutcome,
} from '@medplum/core';
import type { Bundle, OperationOutcome, Resource, SearchParameter } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import {
  IconAdjustmentsHorizontal,
  IconBoxMultiple,
  IconColumns,
  IconFilePlus,
  IconFilter,
  IconRefresh,
  IconTableExport,
  IconTrash,
} from '@tabler/icons-react';
import type { ChangeEvent, JSX, MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export class SearchChangeEvent extends Event {
  readonly definition: SearchRequest;

  constructor(definition: SearchRequest) {
    super('change');
    this.definition = definition;
  }
}

export class SearchLoadEvent extends Event {
  readonly response: Bundle;

  constructor(response: Bundle) {
    super('load');
    this.response = response;
  }
}

export class SearchClickEvent extends Event {
  readonly resource: Resource;
  readonly browserEvent: MouseEvent;

  constructor(resource: Resource, browserEvent: MouseEvent) {
    super('click');
    this.resource = resource;
    this.browserEvent = browserEvent;
  }
}

/**
 * An additional, computed column appended after the search-result columns.
 *
 * Unlike the columns derived from {@link SearchControlProps.search} fields, an
 * additional column is not backed by a search parameter and has no sort/filter
 * menu: it renders arbitrary content per row. Use it for values that must be
 * computed or fetched separately from the searched resource (e.g. a related
 * resource's status).
 */
export interface SearchControlAdditionalColumn {
  /** The column header text. */
  readonly name: string;
  /** Renders the cell contents for the given row resource. */
  readonly renderCell: (resource: Resource) => ReactNode;
}

export interface SearchControlProps {
  readonly search: SearchRequest;
  readonly checkboxesEnabled?: boolean;
  /** Additional computed columns rendered after the search-result columns. */
  readonly additionalColumns?: readonly SearchControlAdditionalColumn[];
  readonly hideToolbar?: boolean;
  readonly hideFilters?: boolean;
  readonly onLoad?: (e: SearchLoadEvent) => void;
  readonly onChange?: (e: SearchChangeEvent) => void;
  readonly onClick?: (e: SearchClickEvent) => void;
  readonly onAuxClick?: (e: SearchClickEvent) => void;
  readonly onNew?: () => void;
  readonly onExport?: () => void;
  readonly onExportCsv?: () => void;
  readonly onExportTransactionBundle?: () => void;
  readonly onDelete?: (ids: string[]) => void;
  readonly onBulk?: (ids: string[]) => void;
}

interface SearchControlState {
  readonly searchResponse?: Bundle;
  readonly selected: { [id: string]: boolean };
  readonly fieldEditorVisible: boolean;
  readonly filterEditorVisible: boolean;
  readonly filterDialogVisible: boolean;
  readonly exportDialogVisible: boolean;
  readonly filterDialogFilter?: Filter;
  readonly filterDialogSearchParam?: SearchParameter;
  readonly dialogOpenTime?: number;
}

/**
 * The SearchControl component represents the embeddable search table control.
 * It includes the table, rows, headers, sorting, etc.
 * It does not include the field editor, filter editor, pagination buttons.
 * @param props - The SearchControl React props.
 * @returns The SearchControl React node.
 */
export function SearchControl(props: SearchControlProps): JSX.Element {
  const medplum = useMedplum();
  const [outcome, setOutcome] = useState<OperationOutcome | undefined>();
  const { search, onLoad } = props;

  const [memoizedSearch, setMemoizedSearch] = useState(search);

  if (!deepEquals(search, memoizedSearch)) {
    setMemoizedSearch(search);
  }

  const [state, setState] = useState<SearchControlState>({
    selected: {},
    fieldEditorVisible: false,
    filterEditorVisible: false,
    exportDialogVisible: false,
    filterDialogVisible: false,
  });

  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  const total = memoizedSearch.total ?? 'accurate';

  const loadResults = useCallback(
    (options?: RequestInit) => {
      setOutcome(undefined);
      medplum
        .requestSchema(memoizedSearch.resourceType)
        .then(() =>
          medplum.search(
            memoizedSearch.resourceType,
            formatSearchQuery({ ...memoizedSearch, total, fields: undefined }),
            options
          )
        )
        .then((response) => {
          setState({ ...stateRef.current, searchResponse: response });
          if (onLoad) {
            onLoad(new SearchLoadEvent(response));
          }
        })
        .catch((reason) => {
          setState({ ...stateRef.current, searchResponse: undefined });
          setOutcome(normalizeOperationOutcome(reason));
        });
    },
    [medplum, memoizedSearch, total, onLoad]
  );

  const refreshResults = useCallback(() => {
    setState({ ...stateRef.current, searchResponse: undefined });
    loadResults({ cache: 'reload' });
  }, [loadResults]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  function handleSingleCheckboxClick(e: ChangeEvent, id: string): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const newSelected = { ...stateRef.current.selected };
    if (checked) {
      newSelected[id] = true;
    } else {
      delete newSelected[id];
    }
    setState({ ...stateRef.current, selected: newSelected });
  }

  function handleAllCheckboxClick(e: ChangeEvent): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const newSelected = {} as { [id: string]: boolean };
    const searchResponse = stateRef.current.searchResponse;
    if (checked && searchResponse?.entry) {
      searchResponse.entry.forEach((entry) => {
        if (entry.resource?.id) {
          newSelected[entry.resource.id] = true;
        }
      });
    }
    setState({ ...stateRef.current, selected: newSelected });
  }

  function isAllSelected(): boolean {
    if (!state.searchResponse?.entry || state.searchResponse.entry.length === 0) {
      return false;
    }
    for (const e of state.searchResponse.entry) {
      if (e.resource?.id && !state.selected[e.resource.id]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Emits a change event to the optional change listener.
   * @param newSearch - The new search definition.
   */
  function emitSearchChange(newSearch: SearchRequest): void {
    if (props.onChange) {
      props.onChange(new SearchChangeEvent(newSearch));
    }
  }

  /**
   * Handles a click on a order row.
   * @param e - The click event.
   * @param resource - The FHIR resource.
   */
  function handleRowClick(e: MouseEvent, resource: Resource): void {
    if (isCheckboxCell(e.target as Element)) {
      // Ignore clicks on checkboxes
      return;
    }

    if (e.button === 2) {
      // Ignore right clicks
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

  function isExportPassed(): boolean {
    return !!(props.onExport ?? props.onExportCsv ?? props.onExportTransactionBundle);
  }

  if (outcome) {
    return <OperationOutcomeAlert outcome={outcome} />;
  }

  if (!isDataTypeLoaded(memoizedSearch.resourceType)) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const checkboxColumn = props.checkboxesEnabled;
  const fields = getFieldDefinitions(memoizedSearch);
  const resourceType = memoizedSearch.resourceType;
  const lastResult = state.searchResponse;
  const entries = lastResult?.entry;
  const resources = entries?.map((e) => e.resource);

  const iconSize = 16;
  const isMobile = window.innerWidth < 768;

  return (
    <div className="w-full" data-testid="search-control">
      {!props.hideToolbar && (
        <div className="mb-8 flex justify-between">
          <div className="flex gap-0.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setState({ ...stateRef.current, fieldEditorVisible: true, dialogOpenTime: Date.now() })}
            >
              <IconColumns size={iconSize} />
              Fields
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setState({ ...stateRef.current, filterEditorVisible: true, dialogOpenTime: Date.now() })}
            >
              <IconFilter size={iconSize} />
              Filters
            </Button>
            {props.onNew && (
              <Button size="sm" variant="ghost" onClick={props.onNew}>
                <IconFilePlus size={iconSize} />
                New...
              </Button>
            )}
            {!isMobile && isExportPassed() && (
              <Button
                size="sm"
                variant="ghost"
                onClick={
                  props.onExport
                    ? props.onExport
                    : () => setState({ ...stateRef.current, exportDialogVisible: true, dialogOpenTime: Date.now() })
                }
              >
                <IconTableExport size={iconSize} />
                Export...
              </Button>
            )}
            {!isMobile && props.onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => (props.onDelete as (ids: string[]) => any)(Object.keys(state.selected))}
              >
                <IconTrash size={iconSize} />
                Delete...
              </Button>
            )}
            {!isMobile && props.onBulk && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => (props.onBulk as (ids: string[]) => any)(Object.keys(state.selected))}
              >
                <IconBoxMultiple size={iconSize} />
                Bulk...
              </Button>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {lastResult && (
              <span className="text-xs text-muted-foreground" data-testid="count-display">
                {getStart(memoizedSearch, lastResult).toLocaleString()}-
                {getEnd(memoizedSearch, lastResult).toLocaleString()}
                {lastResult.total !== undefined &&
                  ` of ${memoizedSearch.total === 'estimate' ? '~' : ''}${lastResult.total?.toLocaleString()}`}
              </span>
            )}
            <Button variant="ghost" size="icon" title="Refresh" aria-label="Refresh" onClick={refreshResults}>
              <IconRefresh size={iconSize} />
            </Button>
          </div>
        </div>
      )}
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
              <TableHead key={field.name}>
                <SearchColumnMenu label={buildFieldNameString(field.name)}>
                  {field.searchParams ? (
                    <SearchPopupMenu
                      search={memoizedSearch}
                      searchParams={field.searchParams}
                      onPrompt={(searchParam, filter) => {
                        setState({
                          ...stateRef.current,
                          filterDialogVisible: true,
                          filterDialogSearchParam: searchParam,
                          filterDialogFilter: filter,
                          dialogOpenTime: Date.now(),
                        });
                      }}
                      onChange={(result) => {
                        emitSearchChange(result);
                      }}
                    />
                  ) : (
                    <DropdownMenuContent />
                  )}
                </SearchColumnMenu>
              </TableHead>
            ))}
            {props.additionalColumns?.map((col) => (
              <TableHead key={col.name} className="p-0.5 font-medium">
                {col.name}
              </TableHead>
            ))}
          </TableRow>
          {!props.hideFilters && (
            <TableRow>
              {checkboxColumn && <TableHead />}
              {fields.map((field) => (
                <TableHead key={field.name}>
                  {field.searchParams && (
                    <FilterDescription
                      resourceType={resourceType}
                      searchParams={field.searchParams}
                      filters={memoizedSearch.filters}
                    />
                  )}
                </TableHead>
              ))}
              {props.additionalColumns?.map((col) => (
                <TableHead key={col.name} />
              ))}
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {resources?.map(
            (resource) =>
              resource && (
                <TableRow
                  key={resource.id}
                  className="cursor-pointer hover:bg-muted"
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
                        checked={!!state.selected[resource.id as string]}
                        onChange={(e) => handleSingleCheckboxClick(e, resource.id as string)}
                      />
                    </TableCell>
                  )}
                  {fields.map((field) => (
                    <TableCell key={field.name}>{renderValue(resource, field)}</TableCell>
                  ))}
                  {props.additionalColumns?.map((col) => (
                    <TableCell key={col.name}>{col.renderCell(resource)}</TableCell>
                  ))}
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
      {!resources?.length && (
        <Container>
          <div className="flex h-[150px] items-center justify-center">
            <p className="text-xl text-muted-foreground">No results</p>
          </div>
        </Container>
      )}
      {lastResult && (
        <div className="m-4 p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  {...getPaginationControlProps('first')}
                  onClick={(event) => {
                    event.preventDefault();
                    emitSearchChange(setPage(memoizedSearch, 1));
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  {...getPaginationControlProps('previous')}
                  onClick={(event) => {
                    event.preventDefault();
                    emitSearchChange(setPage(memoizedSearch, Math.max(1, getPage(memoizedSearch) - 1)));
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {getPage(memoizedSearch)}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  {...getPaginationControlProps('next')}
                  onClick={(event) => {
                    event.preventDefault();
                    emitSearchChange(
                      setPage(
                        memoizedSearch,
                        Math.min(getTotalPages(memoizedSearch, lastResult), getPage(memoizedSearch) + 1)
                      )
                    );
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  {...getPaginationControlProps('last')}
                  onClick={(event) => {
                    event.preventDefault();
                    emitSearchChange(setPage(memoizedSearch, getTotalPages(memoizedSearch, lastResult)));
                  }}
                >
                  {getTotalPages(memoizedSearch, lastResult)}
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <SearchFieldEditor
        key={`search-field-editor-${state.dialogOpenTime}`}
        search={memoizedSearch}
        visible={state.fieldEditorVisible}
        onOk={(result) => {
          emitSearchChange(result);
          setState({
            ...stateRef.current,
            fieldEditorVisible: false,
          });
        }}
        onCancel={() => {
          setState({
            ...stateRef.current,
            fieldEditorVisible: false,
          });
        }}
      />
      <SearchFilterEditor
        key={`search-filter-editor-${state.dialogOpenTime}`}
        search={memoizedSearch}
        visible={state.filterEditorVisible}
        onOk={(result) => {
          emitSearchChange(result);
          setState({
            ...stateRef.current,
            filterEditorVisible: false,
          });
        }}
        onCancel={() => {
          setState({
            ...stateRef.current,
            filterEditorVisible: false,
          });
        }}
      />
      <SearchExportDialog
        key={`search-export-dialog-${state.dialogOpenTime}`}
        visible={state.exportDialogVisible}
        exportCsv={props.onExportCsv}
        exportTransactionBundle={props.onExportTransactionBundle}
        onCancel={() => {
          setState({
            ...stateRef.current,
            exportDialogVisible: false,
          });
        }}
      />
      <SearchFilterValueDialog
        key={`search-filter-dialog-${state.dialogOpenTime}`}
        visible={state.filterDialogVisible}
        title={state.filterDialogSearchParam?.code ? buildFieldNameString(state.filterDialogSearchParam.code) : ''}
        resourceType={resourceType}
        searchParam={state.filterDialogSearchParam}
        filter={state.filterDialogFilter}
        defaultValue=""
        onOk={(filter) => {
          emitSearchChange(addFilter(memoizedSearch, filter.code, filter.operator, filter.value));
          setState({
            ...stateRef.current,
            filterDialogVisible: false,
          });
        }}
        onCancel={() => {
          setState({
            ...stateRef.current,
            filterDialogVisible: false,
          });
        }}
      />
    </div>
  );
}

function SearchColumnMenu(props: { readonly label: string; readonly children: ReactNode }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center justify-between rounded-sm p-0.5 hover:bg-muted"
          onClick={() => setOpen(true)}
        >
          <span className="font-medium">{props.label}</span>
          <span className="flex size-5 items-center justify-center">
            <IconAdjustmentsHorizontal size={14} stroke={1.5} />
          </span>
        </button>
      </DropdownMenuTrigger>
      {props.children}
    </DropdownMenu>
  );
}

interface FilterDescriptionProps {
  readonly resourceType: string;
  readonly searchParams: SearchParameter[];
  readonly filters?: Filter[];
}

function FilterDescription(props: FilterDescriptionProps): JSX.Element {
  const filters = (props.filters ?? []).filter((f) => props.searchParams.find((p) => p.code === f.code));
  if (filters.length === 0) {
    return <span>no filters</span>;
  }

  return (
    <>
      {filters.map((filter: Filter) => (
        <div key={`filter-${filter.code}-${filter.operator}-${filter.value}`}>
          {getOpString(filter.operator)}
          &nbsp;
          <SearchFilterValueDisplay resourceType={props.resourceType} filter={filter} />
        </div>
      ))}
    </>
  );
}

function getPage(search: SearchRequest): number {
  return Math.floor((search.offset ?? 0) / (search.count ?? DEFAULT_SEARCH_COUNT)) + 1;
}

function getTotalPages(search: SearchRequest, lastResult: Bundle): number {
  const pageSize = search.count ?? DEFAULT_SEARCH_COUNT;
  const total = getTotal(search, lastResult);
  return Math.ceil(total / pageSize);
}

function getStart(search: SearchRequest, lastResult: Bundle): number {
  return Math.min(getTotal(search, lastResult), (search.offset ?? 0) + 1);
}

function getEnd(search: SearchRequest, lastResult: Bundle): number {
  return Math.max(getStart(search, lastResult) + (lastResult.entry?.length ?? 0) - 1, 0);
}

function getTotal(search: SearchRequest, lastResult: Bundle): number {
  let total = lastResult.total;
  if (total === undefined) {
    // If the total is not specified, then we have to estimate it
    total =
      (search.offset ?? 0) +
      (lastResult.entry?.length ?? 0) +
      (lastResult.link?.some((l) => l.relation === 'next') ? 1 : 0);
  }
  return total;
}
