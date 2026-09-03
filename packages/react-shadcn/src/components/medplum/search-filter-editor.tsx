// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchFilterEditor/SearchFilterEditor.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ArrayAddButton } from '@/components/medplum/array-add-button';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import {
  addFilter,
  buildSearchParamFieldLabel,
  deleteFilter,
  getOpString,
  getSearchOperators,
  isMetaSearchParam,
  setFilters,
} from '@/components/medplum/search-control/search-utils';
import { SearchFilterValueInput } from '@/components/medplum/search-filter-value-input';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/components/ui/native-select';
import type { Filter, SearchRequest } from '@medplum/core';
import { Operator, deepClone, getSearchParameters } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import { IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface SearchFilterEditorProps {
  readonly visible: boolean;
  readonly search: SearchRequest;
  readonly onOk: (search: SearchRequest) => void;
  readonly onCancel: () => void;
}

export function SearchFilterEditor(props: SearchFilterEditorProps): JSX.Element | null {
  const [search, setSearch] = useState(deepClone(props.search));

  const searchRef = useRef(search);
  useLayoutEffect(() => {
    searchRef.current = search;
  });

  useEffect(() => {
    setSearch(deepClone(props.search));
  }, [props.search]);

  function onAddFilter(filter: Filter): void {
    setSearch(addFilter(searchRef.current, filter.code, filter.operator, filter.value));
  }

  const resourceType = props.search.resourceType;
  const searchParams = getSearchParameters(resourceType) ?? {};
  const filters = search.filters || [];

  return (
    <Modal open={props.visible} onOpenChange={(open) => !open && props.onCancel()} size="xl">
      <ModalHeader>
        <ModalTitle>Filters</ModalTitle>
      </ModalHeader>
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          props.onOk(searchRef.current);
        }}
      >
        <ModalBody>
          <table>
            <colgroup>
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 380 }} />
              <col style={{ width: 40 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Field</th>
                <th>Operation</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filters.map((filter: Filter, index: number) => (
                <FilterRowInput
                  id={`filter-${index}-row`}
                  key={`filter-${index}-row`}
                  resourceType={resourceType}
                  searchParams={searchParams}
                  value={filter}
                  onChange={(newFilter: Filter) => {
                    const newFilters = [...filters];
                    newFilters[index] = newFilter;
                    setSearch(setFilters(searchRef.current, newFilters));
                  }}
                  onDelete={() => setSearch(deleteFilter(searchRef.current, index))}
                />
              ))}
            </tbody>
          </table>
          <ArrayAddButton propertyDisplayName="Filter" onClick={() => onAddFilter({} as Filter)} />
        </ModalBody>
        <ModalFooter>
          <SubmitButton>OK</SubmitButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}

interface FilterRowInputProps {
  readonly id: string;
  readonly resourceType: string;
  readonly searchParams: Record<string, SearchParameter>;
  readonly value: Filter;
  readonly onChange: (value: Filter) => void;
  readonly onDelete?: () => void;
}

function FilterRowInput(props: FilterRowInputProps): JSX.Element {
  const value: Filter = props.value;

  function setFilterCode(newCode: string): void {
    props.onChange({ code: newCode, operator: Operator.EQUALS, value: '' });
  }

  function setFilterOperator(newOperator: Operator): void {
    props.onChange({ code: value.code, operator: newOperator, value: '' });
  }

  function setFilterValue(newFilterValue: string): void {
    props.onChange({ code: value.code, operator: value.operator, value: newFilterValue });
  }

  const searchParam = props.searchParams[value.code];
  const operators = searchParam && getSearchOperators(searchParam);

  const fieldOptions = [];
  const metaOptions = [];
  for (const param of Object.keys(props.searchParams)) {
    const option = { value: param, label: buildSearchParamFieldLabel(param) };
    if (isMetaSearchParam(param)) {
      metaOptions.push(option);
    } else {
      fieldOptions.push(option);
    }
  }

  return (
    <tr>
      <td>
        <NativeSelect
          data-testid={`${props.id}-filter-field`}
          defaultValue={props.value.code}
          onChange={(e) => setFilterCode(e.currentTarget.value)}
        >
          <NativeSelectOption value="" />
          {fieldOptions.length > 0 && (
            <NativeSelectOptGroup label="Fields">
              {fieldOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelectOptGroup>
          )}
          {metaOptions.length > 0 && (
            <NativeSelectOptGroup label="Metadata">
              {metaOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelectOptGroup>
          )}
        </NativeSelect>
      </td>
      <td>
        {operators && (
          <NativeSelect
            key={`${props.id}-filter-value-${props.value.code}`}
            data-testid={`${props.id}-filter-operation`}
            defaultValue={value.operator}
            onChange={(e) => setFilterOperator(e.currentTarget.value as Operator)}
          >
            <NativeSelectOption value="" />
            {operators.map((op) => (
              <NativeSelectOption key={op} value={op}>
                {getOpString(op)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </td>
      <td>
        {searchParam && value.operator && (
          <SearchFilterValueInput
            key={`${props.id}-filter-value-${props.value.code}-${props.value.operator}`}
            name={`${props.id}-filter-value`}
            resourceType={props.resourceType}
            searchParam={searchParam}
            defaultValue={value.value}
            onChange={setFilterValue}
          />
        )}
      </td>
      <td>
        {props.onDelete && (
          <Button variant="outline" size="icon" aria-label="Delete filter" onClick={props.onDelete}>
            <IconX style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </Button>
        )}
      </td>
    </tr>
  );
}
