// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/IdentifierInput/IdentifierInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getErrorsForInput } from '@/lib/medplum/outcomes';
import type { Identifier } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export type IdentifierInputProps = ComplexTypeInputProps<Identifier>;

export function IdentifierInput(props: IdentifierInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue);
  const { elementsByPath, getExtendedProps } = useContext(ElementsContext);

  const [systemElement, valueElement] = useMemo(
    () => ['system', 'value'].map((field) => elementsByPath[props.path + '.' + field]),
    [elementsByPath, props.path]
  );

  const [systemProps, valueProps] = useMemo(
    () => ['system', 'value'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  function setValueWrapper(newValue: Identifier): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }
  const errorPath: string = props.valuePath ?? props.path;
  const systemError = getErrorsForInput(props.outcome, errorPath + '.system');
  const valueError = getErrorsForInput(props.outcome, errorPath + '.value');

  return (
    <div data-slot="identifier-input" className="flex flex-nowrap items-start gap-2 *:flex-1">
      <Field data-invalid={systemError ? true : undefined} className="gap-1">
        <Input
          disabled={props.disabled || systemProps?.readonly}
          placeholder="System"
          required={(systemElement?.min ?? 0) > 0}
          defaultValue={value?.system}
          aria-invalid={systemError ? true : undefined}
          onChange={(e) => setValueWrapper({ ...value, system: e.currentTarget.value })}
        />
        <FieldError>{systemError}</FieldError>
      </Field>
      <Field data-invalid={valueError ? true : undefined} className="gap-1">
        <Input
          disabled={props.disabled || valueProps?.readonly}
          placeholder="Value"
          required={(valueElement?.min ?? 0) > 0}
          defaultValue={value?.value}
          aria-invalid={valueError ? true : undefined}
          onChange={(e) => setValueWrapper({ ...value, value: e.currentTarget.value })}
        />
        <FieldError>{valueError}</FieldError>
      </Field>
    </div>
  );
}
