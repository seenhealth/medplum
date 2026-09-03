// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ElementsInput/ElementsInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CheckboxFormSection } from '@/components/medplum/checkbox-form-section';
import { EXTENSION_KEYS, ElementsContext, getElementsToRender } from '@/components/medplum/elements-input-utils';
import {
  FormSection,
  FormSectionContent,
  FormSectionDescription,
  FormSectionError,
  FormSectionLabel,
} from '@/components/medplum/form-section';
import { setPropertyValue } from '@/components/medplum/resource-form-utils';
import { getValueAndTypeFromElement } from '@/components/medplum/resource-property-display-utils';
import { ResourcePropertyInput } from '@/components/medplum/resource-property-input';
import type { BaseInputProps } from '@/components/medplum/resource-property-input-utils';
import type { TypedValue } from '@medplum/core';
import { getPathDisplayName } from '@medplum/core';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export interface ElementsInputProps extends BaseInputProps {
  readonly type: string;
  readonly defaultValue: any;
  readonly onChange: ((value: any) => void) | undefined;
  readonly testId?: string;
}

export function ElementsInput(props: ElementsInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue ?? {});
  const elementsContext = useContext(ElementsContext);
  const elementsToRender = useMemo(() => {
    return getElementsToRender(elementsContext.elements);
  }, [elementsContext.elements]);

  function setValueWrapper(newValue: any): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  const typedValue: TypedValue = { type: props.type, value };

  return (
    <div className="flex flex-1 flex-col gap-4" data-testid={props.testId}>
      {elementsToRender.map(([key, element]) => {
        const [propertyValue, propertyType] = getValueAndTypeFromElement(typedValue, key, element);
        const required = element.min !== undefined && element.min > 0;
        const valuePath = props.valuePath ? props.valuePath + '.' + key : undefined;
        const resourcePropertyInput = (
          <ResourcePropertyInput
            key={key}
            property={element}
            name={key}
            path={props.path + '.' + key}
            valuePath={valuePath}
            defaultValue={propertyValue}
            defaultPropertyType={propertyType}
            onChange={(newValue: any, propName?: string) => {
              setValueWrapper(setPropertyValue({ ...value }, key, propName ?? key, element, newValue));
            }}
            outcome={props.outcome}
          />
        );

        // no FormSection wrapper for extensions
        if (props.type === 'Extension' || EXTENSION_KEYS.includes(key)) {
          return resourcePropertyInput;
        }

        if (element.type.length === 1 && element.type[0].code === 'boolean') {
          return (
            <CheckboxFormSection key={key} htmlFor={key} fhirPath={element.path} readonly={element.readonly}>
              {resourcePropertyInput}
              <FormSectionContent>
                <FormSectionLabel required={required}>{getPathDisplayName(key)}</FormSectionLabel>
                <FormSectionDescription>{element.description}</FormSectionDescription>
                <FormSectionError />
              </FormSectionContent>
            </CheckboxFormSection>
          );
        }

        return (
          <FormSection
            key={key}
            htmlFor={key}
            outcome={props.outcome}
            fhirPath={element.path}
            errorExpression={valuePath}
            readonly={element.readonly}
          >
            <FormSectionLabel required={required}>{getPathDisplayName(key)}</FormSectionLabel>
            <FormSectionDescription>{element.description}</FormSectionDescription>
            {resourcePropertyInput}
            <FormSectionError />
          </FormSection>
        );
      })}
    </div>
  );
}
