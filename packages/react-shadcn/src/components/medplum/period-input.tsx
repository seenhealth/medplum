// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PeriodInput/PeriodInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import type { Period } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export interface PeriodInputProps extends ComplexTypeInputProps<Period> {}

export function PeriodInput(props: PeriodInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue);
  const { getExtendedProps } = useContext(ElementsContext);
  const [startProps, endProps] = useMemo(
    () => ['start', 'end'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  function setValueWrapper(newValue: Period): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div data-slot="period-input" className="flex flex-nowrap gap-2 *:flex-1">
      <DateTimeInput
        disabled={props.disabled || startProps?.readonly}
        name={props.name + '.start'}
        placeholder="Start"
        defaultValue={value?.start}
        onChange={(newValue) => setValueWrapper({ ...value, start: newValue })}
      />
      <DateTimeInput
        disabled={props.disabled || endProps?.readonly}
        name={props.name + '.end'}
        placeholder="End"
        defaultValue={value?.end}
        onChange={(newValue) => setValueWrapper({ ...value, end: newValue })}
      />
    </div>
  );
}
