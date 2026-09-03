// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuantityInput/QuantityInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { Quantity } from '@medplum/fhirtypes';
import type { JSX, WheelEvent } from 'react';
import { useContext, useMemo, useState } from 'react';

export interface QuantityInputProps extends ComplexTypeInputProps<Quantity> {
  readonly autoFocus?: boolean;
  readonly required?: boolean;
  readonly disableWheel?: boolean;
}

export function QuantityInput(props: QuantityInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue);
  const { getExtendedProps } = useContext(ElementsContext);
  const [comparatorProps, valueProps, unitProps] = useMemo(
    () => ['comparator', 'value', 'unit'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  function setValueWrapper(newValue: Quantity): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div data-slot="quantity-input" className="flex flex-nowrap gap-2 *:flex-1">
      <NativeSelect
        disabled={props.disabled || comparatorProps?.readonly}
        className="w-20"
        data-testid={props.name + '-comparator'}
        defaultValue={value?.comparator}
        onChange={(e) =>
          setValueWrapper({
            ...value,
            comparator: e.currentTarget.value as '<' | '<=' | '>=' | '>',
          })
        }
      >
        {['', '<', '<=', '>=', '>'].map((comparator) => (
          <NativeSelectOption key={comparator} value={comparator}>
            {comparator}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Input
        disabled={props.disabled || valueProps?.readonly}
        id={props.name}
        name={props.name}
        required={props.required}
        data-autofocus={props.autoFocus}
        data-testid={props.name + '-value'}
        type="number"
        placeholder="Value"
        defaultValue={value?.value}
        autoFocus={props.autoFocus}
        step="any"
        onWheel={(e: WheelEvent<HTMLInputElement>) => {
          if (props.disableWheel) {
            e.currentTarget.blur();
          }
        }}
        onChange={(e) => {
          setValueWrapper({
            ...value,
            value: tryParseNumber(e.currentTarget.value),
          });
        }}
      />
      <Input
        disabled={props.disabled || unitProps?.readonly}
        placeholder="Unit"
        data-testid={props.name + '-unit'}
        defaultValue={value?.unit}
        onChange={(e) =>
          setValueWrapper({
            ...value,
            unit: e.currentTarget.value,
          })
        }
      />
    </div>
  );
}

function tryParseNumber(str: string): number | undefined {
  if (!str) {
    return undefined;
  }
  return Number.parseFloat(str);
}
