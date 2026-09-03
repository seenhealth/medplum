// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RatioInput/RatioInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { QuantityInput } from '@/components/medplum/quantity-input';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import type { Ratio } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export interface RatioInputProps extends ComplexTypeInputProps<Ratio> {}

/**
 * Renders a Ratio input.
 * See: https://www.hl7.org/fhir/datatypes.html#Ratio
 * @param props - Ratio input properties.
 * @returns Ratio input element.
 */
export function RatioInput(props: RatioInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue);
  const { getExtendedProps } = useContext(ElementsContext);
  const [numeratorProps, denominatorProps] = useMemo(
    () => ['numerator', 'denominator'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  function setValueWrapper(newValue: Ratio): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div data-slot="ratio-input" className="flex flex-nowrap gap-2 *:flex-1">
      <QuantityInput
        path={props.path + '.numerator'}
        disabled={props.disabled || numeratorProps?.readonly}
        name={props.name + '-numerator'}
        defaultValue={value?.numerator}
        onChange={(v) =>
          setValueWrapper({
            ...value,
            numerator: v,
          })
        }
      />
      <QuantityInput
        path={props.path + '.denominator'}
        disabled={props.disabled || denominatorProps?.readonly}
        name={props.name + '-denominator'}
        defaultValue={value?.denominator}
        onChange={(v) =>
          setValueWrapper({
            ...value,
            denominator: v,
          })
        }
      />
    </div>
  );
}
