// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceInput/ResourceInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { AsyncAutocompleteOption, AsyncAutocompleteProps } from '@/components/medplum/async-autocomplete';
import { MultiResourceInput } from '@/components/medplum/multi-resource-input';
import type { Reference, Resource } from '@medplum/fhirtypes';
import type { JSX, ReactNode } from 'react';
import { useCallback } from 'react';

export interface ResourceInputProps<T extends Resource = Resource> {
  readonly resourceType: T['resourceType'];
  readonly name: string;
  readonly defaultValue?: T | Reference<T>;
  readonly searchCriteria?: Record<string, string>;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly itemComponent?: (props: AsyncAutocompleteOption<T>) => JSX.Element | ReactNode;
  readonly onChange?: (value: T | undefined) => void;
  readonly disabled?: boolean;
  readonly label?: AsyncAutocompleteProps<T>['label'];
  readonly error?: AsyncAutocompleteProps<T>['error'];
}

/**
 * @param props - The props for the ResourceInput component.
 * @returns The ResourceInput component.
 */
export function ResourceInput<T extends Resource = Resource>(props: ResourceInputProps<T>): JSX.Element | null {
  const onChange = props.onChange;

  const handleChange = useCallback(
    (newResources: T[]) => {
      if (onChange) {
        onChange(newResources[0]);
      }
    },
    [onChange]
  );

  return (
    <MultiResourceInput<T>
      resourceType={props.resourceType}
      name={props.name}
      defaultValue={props.defaultValue ? [props.defaultValue] : undefined}
      searchCriteria={props.searchCriteria}
      placeholder={props.placeholder}
      required={props.required}
      itemComponent={props.itemComponent}
      onChange={handleChange}
      disabled={props.disabled}
      label={props.label}
      error={props.error}
      maxValues={1}
    />
  );
}
