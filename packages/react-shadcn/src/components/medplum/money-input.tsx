// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/MoneyInput/MoneyInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { Money } from '@medplum/fhirtypes';
import { IconCurrencyDollar } from '@tabler/icons-react';
import type { ChangeEvent, JSX } from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';

/*
 * Based on: https://github.com/mantinedev/ui.mantine.dev/blob/master/components/CurrencyInput/CurrencyInput.tsx
 */

/**
 * List of currencies.
 *
 * Full list of currencies:
 * https://www.hl7.org/fhir/valueset-currencies.html
 *
 * Latest browsers can report list of supported currencies, but it's not widely supported:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf
 *
 * Using a short list for simplicity for now.
 */
const data = ['USD', 'EUR', 'CAD', 'GBP', 'AUD'];

export interface MoneyInputProps extends ComplexTypeInputProps<Money> {
  readonly label?: string;
  readonly placeholder?: string;
}

export function MoneyInput(props: MoneyInputProps): JSX.Element {
  const { onChange } = props;
  const [value, setValue] = useState(props.defaultValue);
  const { getExtendedProps } = useContext(ElementsContext);
  const [currencyProps, valueProps] = useMemo(
    () => ['currency', 'value'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  const setValueWrapper = useCallback(
    (newValue: Money): void => {
      setValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleCurrencyChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setValueWrapper({
        ...value,
        currency: e.currentTarget.value as Money['currency'],
      });
    },
    [value, setValueWrapper]
  );

  const handleValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValueWrapper({
        ...value,
        value: e.currentTarget.valueAsNumber,
      });
    },
    [value, setValueWrapper]
  );

  const select = (
    <NativeSelect
      disabled={props.disabled || currencyProps?.readonly}
      defaultValue={value?.currency}
      className="w-[92px] rounded-none border-0 font-medium shadow-none"
      onChange={handleCurrencyChange}
    >
      {data.map((currency) => (
        <NativeSelectOption key={currency} value={currency}>
          {currency}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );

  const input = (
    <InputGroup data-slot="money-input">
      <InputGroupAddon>
        <IconCurrencyDollar size={14} />
      </InputGroupAddon>
      <InputGroupInput
        disabled={props.disabled || valueProps?.readonly}
        type="number"
        name={props.name}
        placeholder={props.placeholder ?? 'Value'}
        defaultValue={value?.value?.toString() ?? 'USD'}
        onChange={handleValueChange}
      />
      <InputGroupAddon align="inline-end" className="w-[92px] p-0">
        {select}
      </InputGroupAddon>
    </InputGroup>
  );

  if (props.label) {
    return (
      <FormSection>
        <FormSectionLabel>{props.label}</FormSectionLabel>
        {input}
      </FormSection>
    );
  }

  return input;
}
