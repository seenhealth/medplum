// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodeInput/CodeInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ValueSetAutocompleteProps } from '@/components/medplum/value-set-autocomplete';
import { ValueSetAutocomplete } from '@/components/medplum/value-set-autocomplete';
import type { ValueSetExpansionContains } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useState } from 'react';

export interface CodeInputProps extends Omit<ValueSetAutocompleteProps, 'defaultValue' | 'onChange'> {
  readonly defaultValue?: string;
  readonly onChange: ((value: string | undefined) => void) | undefined;
}

export function CodeInput(props: CodeInputProps): JSX.Element {
  const { defaultValue, onChange, withHelpText, ...rest } = props;
  const [value, setValue] = useState(defaultValue);

  function handleChange(newValues: ValueSetExpansionContains[]): void {
    const newValue = newValues[0];
    const newCode = valueSetElementToCode(newValue);
    setValue(newCode);
    if (onChange) {
      onChange(newCode);
    }
  }

  return (
    <ValueSetAutocomplete
      defaultValue={codeToValueSetElement(value)}
      onChange={handleChange}
      withHelpText={withHelpText ?? true}
      {...rest}
    />
  );
}

function codeToValueSetElement(code: string | undefined): ValueSetExpansionContains | undefined {
  return code ? { code } : undefined;
}

function valueSetElementToCode(element: ValueSetExpansionContains | undefined): string | undefined {
  return element?.code;
}
