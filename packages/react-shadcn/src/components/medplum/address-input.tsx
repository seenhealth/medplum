// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AddressInput/AddressInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { trimTrailingEmptyElements } from '@medplum/core';
import type { Address } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

function getLine(address: Address, index: number): string {
  return address.line && address.line.length > index ? address.line[index] : '';
}

function setLine(address: Address, index: number, str: string): Address {
  const line: string[] = address.line || [];
  while (line.length <= index) {
    line.push('');
  }
  line[index] = str;
  return { ...address, line: trimTrailingEmptyElements(line) };
}

export type AddressInputProps = ComplexTypeInputProps<Address>;

export function AddressInput(props: AddressInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue || {});

  const { getExtendedProps } = useContext(ElementsContext);
  const [useProps, typeProps, line1Props, line2Props, cityProps, stateProps, postalCodeProps] = useMemo(
    () =>
      ['use', 'type', 'line1', 'line2', 'city', 'state', 'postalCode'].map((field) =>
        getExtendedProps(props.path + '.' + field)
      ),
    [getExtendedProps, props.path]
  );

  // TODO{profiles} is it worth the complexity of subbing in an autocomplete input when
  // a binding is defined in a profile? If so, it should go in a new wrapper around TextInput
  // e.g. US Core Patient Profile

  function setValueWrapper(newValue: Partial<Address>): void {
    setValue((prevValue) => ({ ...prevValue, ...newValue }));
    if (props.onChange) {
      props.onChange({ ...value, ...newValue });
    }
  }

  function setUse(use: 'home' | 'work' | 'temp' | 'old' | 'billing'): void {
    setValueWrapper({ use });
  }

  function setType(type: 'postal' | 'physical' | 'both'): void {
    setValueWrapper({ type });
  }

  function setLine1(line1: string): void {
    setValueWrapper(setLine(value, 0, line1));
  }

  function setLine2(line2: string): void {
    setValueWrapper(setLine(value, 1, line2));
  }

  function setCity(city: string): void {
    setValueWrapper({ city });
  }

  function setState(state: string): void {
    setValueWrapper({ state });
  }

  function setPostalCode(postalCode: string): void {
    setValueWrapper({ postalCode });
  }

  return (
    <div data-slot="address-input" className="flex flex-nowrap gap-2 *:flex-1">
      <NativeSelect
        disabled={props.disabled || useProps?.readonly}
        data-testid="address-use"
        defaultValue={value.use}
        onChange={(e) => setUse(e.currentTarget.value as 'home' | 'work' | 'temp' | 'old' | 'billing')}
      >
        {['', 'home', 'work', 'temp', 'old', 'billing'].map((use) => (
          <NativeSelectOption key={use} value={use}>
            {use}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        disabled={props.disabled || typeProps?.readonly}
        data-testid="address-type"
        defaultValue={value.type}
        onChange={(e) => setType(e.currentTarget.value as 'postal' | 'physical' | 'both')}
      >
        {['', 'postal', 'physical', 'both'].map((type) => (
          <NativeSelectOption key={type} value={type}>
            {type}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Input
        disabled={props.disabled || line1Props?.readonly}
        placeholder="Line 1"
        defaultValue={getLine(value, 0)}
        onChange={(e) => setLine1(e.currentTarget.value)}
      />
      <Input
        disabled={props.disabled || line2Props?.readonly}
        placeholder="Line 2"
        defaultValue={getLine(value, 1)}
        onChange={(e) => setLine2(e.currentTarget.value)}
      />
      <Input
        disabled={props.disabled || cityProps?.readonly}
        placeholder="City"
        defaultValue={value.city}
        onChange={(e) => setCity(e.currentTarget.value)}
      />
      <Input
        disabled={props.disabled || stateProps?.readonly}
        placeholder="State"
        defaultValue={value.state}
        onChange={(e) => setState(e.currentTarget.value)}
      />
      <Input
        disabled={props.disabled || postalCodeProps?.readonly}
        placeholder="Postal Code"
        defaultValue={value.postalCode}
        onChange={(e) => setPostalCode(e.currentTarget.value)}
      />
    </div>
  );
}
