// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/HumanNameInput/HumanNameInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { getErrorsForInput } from '@/lib/medplum/outcomes';
import type { HumanName } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export type HumanNameInputProps = ComplexTypeInputProps<HumanName>;

export function HumanNameInput(props: HumanNameInputProps): JSX.Element {
  const { outcome, path } = props;
  const [value, setValue] = useState(props.defaultValue);
  const { getExtendedProps } = useContext(ElementsContext);
  const [useProps, prefixProps, givenProps, familyProps, suffixProps] = useMemo(
    () => ['use', 'prefix', 'given', 'family', 'suffix'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  function setValueWrapper(newValue: HumanName): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  function setUse(use: 'temp' | 'old' | 'usual' | 'official' | 'nickname' | 'anonymous' | 'maiden' | undefined): void {
    // || instead of ?? to handle empty strings
    setValueWrapper({ ...value, use: use || undefined });
  }

  function setPrefix(prefix: string): void {
    setValueWrapper({
      ...value,
      prefix: prefix ? prefix.split(' ') : undefined,
    });
  }

  function setGiven(given: string): void {
    setValueWrapper({
      ...value,
      given: given ? given.split(' ') : undefined,
    });
  }

  function setFamily(family: string): void {
    setValueWrapper({
      ...value,
      // || instead of ?? to handle empty strings
      family: family || undefined,
    });
  }

  function setSuffix(suffix: string): void {
    setValueWrapper({
      ...value,
      suffix: suffix ? suffix.split(' ') : undefined,
    });
  }

  const errorPath = props.valuePath ?? path;
  const useError = getErrorsForInput(outcome, errorPath + '.use');
  const prefixError = getErrorsForInput(outcome, errorPath + '.prefix');
  const givenError = getErrorsForInput(outcome, errorPath + '.given');
  const familyError = getErrorsForInput(outcome, errorPath + '.family');
  const suffixError = getErrorsForInput(outcome, errorPath + '.suffix');

  return (
    <div data-slot="human-name-input" className="flex flex-nowrap gap-2 *:flex-1">
      <Field data-invalid={useError ? true : undefined} className="gap-1">
        <NativeSelect
          disabled={props.disabled || useProps?.readonly}
          defaultValue={value?.use}
          name={props.name + '-use'}
          data-testid="use"
          aria-invalid={useError ? true : undefined}
          onChange={(e) =>
            setUse(e.currentTarget.value as 'temp' | 'old' | 'usual' | 'official' | 'nickname' | 'anonymous' | 'maiden')
          }
        >
          {['', 'temp', 'old', 'usual', 'official', 'nickname', 'anonymous', 'maiden'].map((use) => (
            <NativeSelectOption key={use} value={use}>
              {use}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError>{useError}</FieldError>
      </Field>
      <Field data-invalid={prefixError ? true : undefined} className="gap-1">
        <Input
          disabled={props.disabled || prefixProps?.readonly}
          placeholder="Prefix"
          name={props.name + '-prefix'}
          defaultValue={value?.prefix?.join(' ')}
          aria-invalid={prefixError ? true : undefined}
          onChange={(e) => setPrefix(e.currentTarget.value)}
        />
        <FieldError>{prefixError}</FieldError>
      </Field>
      <Field data-invalid={givenError ? true : undefined} className="gap-1">
        <Input
          disabled={props.disabled || givenProps?.readonly}
          placeholder="Given"
          name={props.name + '-given'}
          defaultValue={value?.given?.join(' ')}
          aria-invalid={givenError ? true : undefined}
          onChange={(e) => setGiven(e.currentTarget.value)}
        />
        <FieldError>{givenError}</FieldError>
      </Field>
      <Field data-invalid={familyError ? true : undefined} className="gap-1">
        <Input
          disabled={props.disabled || familyProps?.readonly}
          name={props.name + '-family'}
          placeholder="Family"
          defaultValue={value?.family}
          aria-invalid={familyError ? true : undefined}
          onChange={(e) => setFamily(e.currentTarget.value)}
        />
        <FieldError>{familyError}</FieldError>
      </Field>
      <Field data-invalid={suffixError ? true : undefined} className="gap-1">
        <Input
          disabled={props.disabled || suffixProps?.readonly}
          placeholder="Suffix"
          name={props.name + '-suffix'}
          defaultValue={value?.suffix?.join(' ')}
          aria-invalid={suffixError ? true : undefined}
          onChange={(e) => setSuffix(e.currentTarget.value)}
        />
        <FieldError>{suffixError}</FieldError>
      </Field>
    </div>
  );
}
