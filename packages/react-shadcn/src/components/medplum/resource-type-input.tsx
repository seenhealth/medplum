// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceTypeInput/ResourceTypeInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeInput } from '@/components/medplum/code-input';
import type { ResourceType } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface ResourceTypeInputProps {
  readonly name: string;
  readonly placeholder?: string;
  readonly defaultValue?: ResourceType;
  readonly autoFocus?: boolean;
  readonly testId?: string;
  readonly maxValues?: number;
  readonly onChange?: (value: ResourceType | undefined) => void;
  readonly disabled?: boolean;
}

export function ResourceTypeInput(props: ResourceTypeInputProps): JSX.Element {
  const [resourceType, setResourceType] = useState(props.defaultValue);
  const onChange = props.onChange;

  const setResourceTypeWrapper = useCallback(
    (newResourceType: string | undefined) => {
      setResourceType(newResourceType as ResourceType);
      if (onChange) {
        onChange(newResourceType as ResourceType);
      }
    },
    [onChange]
  );

  return (
    <CodeInput
      disabled={props.disabled}
      data-autofocus={props.autoFocus}
      data-testid={props.testId}
      defaultValue={resourceType}
      onChange={setResourceTypeWrapper}
      name={props.name}
      placeholder={props.placeholder}
      binding="https://medplum.com/fhir/ValueSet/resource-types"
      creatable={false}
      maxValues={props.maxValues ?? 1}
      clearable={false}
      withHelpText={false}
    />
  );
}
