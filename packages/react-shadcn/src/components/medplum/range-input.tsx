// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RangeInput/RangeInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { QuantityInput } from '@/components/medplum/quantity-input';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import type { Range } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export interface RangeInputProps extends ComplexTypeInputProps<Range> {}

/**
 * Renders a Range input.
 * See: https://www.hl7.org/fhir/datatypes.html#Range
 * @param props - Range input properties.
 * @returns Range input element.
 */
export function RangeInput(props: RangeInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue);
  const { getExtendedProps } = useContext(ElementsContext);
  const [lowProps, highProps] = useMemo(
    () => ['low', 'high'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  function setValueWrapper(newValue: Range): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div data-slot="range-input" className="flex flex-nowrap gap-2 *:flex-1">
      <QuantityInput
        path={props.path + '.low'}
        disabled={props.disabled || lowProps?.readonly}
        name={props.name + '-low'}
        defaultValue={value?.low}
        onChange={(v) =>
          setValueWrapper({
            ...value,
            low: v,
          })
        }
      />

      <QuantityInput
        path={props.path + '.high'}
        disabled={props.disabled || highProps?.readonly}
        name={props.name + '-high'}
        defaultValue={value?.high}
        onChange={(v) =>
          setValueWrapper({
            ...value,
            high: v,
          })
        }
      />
    </div>
  );
}
