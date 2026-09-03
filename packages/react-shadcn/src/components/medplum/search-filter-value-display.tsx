// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchFilterValueDisplay/SearchFilterValueDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ResourceName } from '@/components/medplum/resource-name';
import type { Filter } from '@medplum/core';
import { formatDateTime, getSearchParameterDetails, globalSchema, Operator, SearchParameterType } from '@medplum/core';
import type { JSX } from 'react';

export interface SearchFilterValueDisplayProps {
  readonly resourceType: string;
  readonly filter: Filter;
}

export function SearchFilterValueDisplay(props: SearchFilterValueDisplayProps): JSX.Element {
  const { resourceType, filter } = props;

  const searchParam = globalSchema.types[resourceType].searchParams?.[filter.code];
  if (searchParam) {
    if (
      searchParam.type === 'reference' &&
      (filter.operator === Operator.EQUALS || filter.operator === Operator.NOT_EQUALS)
    ) {
      return <ResourceName value={{ reference: filter.value }} />;
    }

    const searchParamDetails = getSearchParameterDetails(resourceType, searchParam);
    if (filter.code === '_lastUpdated' || searchParamDetails.type === SearchParameterType.DATETIME) {
      return <>{formatDateTime(filter.value)}</>;
    }
  }

  return <>{filter.value}</>;
}
