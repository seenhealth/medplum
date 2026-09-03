// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodingInput/CodingInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import type { ValueSetAutocompleteProps } from '@/components/medplum/value-set-autocomplete';
import { ValueSetAutocomplete } from '@/components/medplum/value-set-autocomplete';
import type { Coding, QuestionnaireResponseItem, ValueSetExpansionContains } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useState } from 'react';

export interface CodingInputProps
  extends
    Omit<ValueSetAutocompleteProps, 'defaultValue' | 'onChange' | 'disabled' | 'name'>,
    ComplexTypeInputProps<Coding> {
  readonly response?: QuestionnaireResponseItem;
}

export function CodingInput(props: CodingInputProps): JSX.Element {
  const { defaultValue, onChange, withHelpText, response, ...rest } = props;
  const [value, setValue] = useState(response?.answer?.[0]?.valueCoding ?? defaultValue);

  function handleChange(newValues: ValueSetExpansionContains[]): void {
    const newValue = newValues[0];
    const newConcept = newValue && valueSetElementToCoding(newValue);
    setValue(newConcept);
    if (onChange) {
      onChange(newConcept);
    }
  }

  return (
    <ValueSetAutocomplete
      defaultValue={value ? codingToValueSetElement(value) : undefined}
      maxValues={1}
      onChange={handleChange}
      withHelpText={withHelpText ?? true}
      {...rest}
    />
  );
}

export function codingToValueSetElement(coding: Coding): ValueSetExpansionContains {
  return {
    system: coding.system,
    code: coding.code,
    display: coding.display,
  };
}

export function valueSetElementToCoding(element: ValueSetExpansionContains): Coding {
  return {
    system: element.system,
    code: element.code,
    display: element.display,
  };
}
