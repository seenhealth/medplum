// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchFilterValueInput/SearchFilterValueInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { QuantityInput } from '@/components/medplum/quantity-input';
import { ReferenceInput } from '@/components/medplum/reference-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getSearchParameterDetails, SearchParameterType } from '@medplum/core';
import type { Quantity, Reference, SearchParameter } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface SearchFilterValueInputProps {
  readonly resourceType: string;
  readonly searchParam: SearchParameter;
  readonly name?: string;
  readonly defaultValue?: string;
  readonly autoFocus?: boolean;
  readonly onChange: (value: string) => void;
}

export function SearchFilterValueInput(props: SearchFilterValueInputProps): JSX.Element | null {
  const details = getSearchParameterDetails(props.resourceType, props.searchParam);
  const name = props.name ?? 'filter-value';

  switch (details.type) {
    case SearchParameterType.REFERENCE:
      return (
        <ReferenceInput
          name={name}
          defaultValue={props.defaultValue ? { reference: props.defaultValue } : undefined}
          targetTypes={props.searchParam.target}
          autoFocus={props.autoFocus}
          onChange={(newReference: Reference | undefined) => {
            if (newReference) {
              props.onChange(newReference.reference as string);
            } else {
              props.onChange('');
            }
          }}
        />
      );

    case SearchParameterType.BOOLEAN:
      return (
        <Checkbox
          name={name}
          data-autofocus={props.autoFocus}
          data-testid={name}
          defaultChecked={props.defaultValue === 'true'}
          autoFocus={props.autoFocus}
          onCheckedChange={(checked) => props.onChange((checked === true).toString())}
        />
      );

    case SearchParameterType.DATE:
      return (
        <Input
          type="date"
          name={name}
          data-autofocus={props.autoFocus}
          data-testid={name}
          defaultValue={props.defaultValue}
          autoFocus={props.autoFocus}
          onChange={(e) => props.onChange(e.currentTarget.value)}
        />
      );

    case SearchParameterType.DATETIME:
      return (
        <DateTimeInput
          name={name}
          defaultValue={props.defaultValue}
          autoFocus={props.autoFocus}
          onChange={props.onChange}
        />
      );

    case SearchParameterType.NUMBER:
      return (
        <Input
          type="number"
          name={name}
          data-autofocus={props.autoFocus}
          data-testid={name}
          defaultValue={props.defaultValue}
          autoFocus={props.autoFocus}
          onChange={(e) => props.onChange(e.currentTarget.value)}
        />
      );

    case SearchParameterType.QUANTITY:
      return (
        <QuantityInput
          name={name}
          path=""
          defaultValue={tryParseQuantity(props.defaultValue)}
          autoFocus={props.autoFocus}
          onChange={(newQuantity: Quantity | undefined) => {
            if (newQuantity) {
              props.onChange(`${newQuantity.value}`);
            } else {
              props.onChange('');
            }
          }}
        />
      );

    default:
      return (
        <Input
          name={name}
          data-autofocus={props.autoFocus}
          data-testid={name}
          defaultValue={props.defaultValue}
          autoFocus={props.autoFocus}
          onChange={(e) => props.onChange(e.currentTarget.value)}
          placeholder="Search value"
        />
      );
  }
}

function tryParseQuantity(value: string | undefined): Quantity | undefined {
  if (value) {
    const [valueString, systemString, unitString] = value.split('|');
    if (valueString) {
      return {
        value: Number.parseFloat(valueString),
        system: systemString,
        unit: unitString,
      };
    }
  }
  return undefined;
}
