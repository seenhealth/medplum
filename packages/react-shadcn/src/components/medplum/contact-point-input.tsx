// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactPointInput/ContactPointInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { getErrorsForInput } from '@/lib/medplum/outcomes';
import type { ContactPoint } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export type ContactPointInputProps = ComplexTypeInputProps<ContactPoint> & {
  readonly onChange?: (value: ContactPoint | undefined) => void;
};

export function ContactPointInput(props: ContactPointInputProps): JSX.Element {
  const { path, outcome } = props;
  const { elementsByPath, getExtendedProps } = useContext(ElementsContext);
  const [contactPoint, setContactPoint] = useState(props.defaultValue);

  const [systemElement, useElement, valueElement] = useMemo(
    () => ['system', 'use', 'value'].map((field) => elementsByPath[path + '.' + field]),
    [elementsByPath, path]
  );
  const [systemProps, useProps, valueProps] = useMemo(
    () => ['system', 'use', 'value'].map((field) => getExtendedProps(path + '.' + field)),
    [getExtendedProps, path]
  );

  function setContactPointWrapper(newValue: ContactPoint | undefined): void {
    if (newValue && Object.keys(newValue).length === 0) {
      newValue = undefined;
    }
    setContactPoint(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  function setSystem(system: 'url' | 'phone' | 'fax' | 'email' | 'pager' | 'sms' | 'other'): void {
    const newValue: ContactPoint = { ...contactPoint, system };
    if (!system) {
      delete newValue.system;
    }
    setContactPointWrapper(newValue);
  }

  function setUse(use: 'home' | 'work' | 'temp' | 'old' | 'mobile'): void {
    const newValue: ContactPoint = { ...contactPoint, use };
    if (!use) {
      delete newValue.use;
    }
    setContactPointWrapper(newValue);
  }

  function setValue(value: string): void {
    const newValue: ContactPoint = { ...contactPoint, value };
    if (!value) {
      delete newValue.value;
    }
    setContactPointWrapper(newValue);
  }

  const errorPath = props.valuePath ?? path;
  const systemError = getErrorsForInput(outcome, errorPath + '.system');
  const useError = getErrorsForInput(outcome, errorPath + '.use');
  const valueError = getErrorsForInput(outcome, errorPath + '.value');

  return (
    <div data-slot="contact-point-input" className="flex flex-nowrap items-start gap-2 *:flex-1">
      <Field data-invalid={systemError ? true : undefined} className="gap-1">
        <NativeSelect
          disabled={props.disabled || systemProps?.readonly}
          data-testid="system"
          defaultValue={contactPoint?.system}
          required={(systemElement?.min ?? 0) > 0}
          aria-invalid={systemError ? true : undefined}
          onChange={(e) =>
            setSystem(e.currentTarget.value as 'url' | 'phone' | 'fax' | 'email' | 'pager' | 'sms' | 'other')
          }
        >
          {['', 'email', 'phone', 'fax', 'pager', 'sms', 'url', 'other'].map((system) => (
            <NativeSelectOption key={system} value={system}>
              {system}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError>{systemError}</FieldError>
      </Field>
      <Field data-invalid={useError ? true : undefined} className="gap-1">
        <NativeSelect
          disabled={props.disabled || useProps?.readonly}
          data-testid="use"
          defaultValue={contactPoint?.use}
          required={(useElement?.min ?? 0) > 0}
          aria-invalid={useError ? true : undefined}
          onChange={(e) => setUse(e.currentTarget.value as 'home' | 'work' | 'temp' | 'old' | 'mobile')}
        >
          {['', 'home', 'work', 'temp', 'old', 'mobile'].map((use) => (
            <NativeSelectOption key={use} value={use}>
              {use}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError>{useError}</FieldError>
      </Field>
      <Field data-invalid={valueError ? true : undefined} className="gap-1">
        <Input
          disabled={props.disabled || valueProps?.readonly}
          placeholder="Value"
          defaultValue={contactPoint?.value}
          required={(valueElement?.min ?? 0) > 0}
          aria-invalid={valueError ? true : undefined}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
        <FieldError>{valueError}</FieldError>
      </Field>
    </div>
  );
}
