// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SliceInput/SliceInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ArrayAddButton } from '@/components/medplum/array-add-button';
import { ArrayRemoveButton } from '@/components/medplum/array-remove-button';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import {
  FormSection,
  FormSectionDescription,
  FormSectionError,
  FormSectionLabel,
} from '@/components/medplum/form-section';
import { ElementDefinitionTypeInput } from '@/components/medplum/resource-property-input';
import type { BaseInputProps } from '@/components/medplum/resource-property-input-utils';
import { killEvent } from '@/lib/medplum/dom';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import type { ElementsContextType, ExtendedInternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import { buildElementsContext, getPropertyDisplayName, isEmpty, isPopulated } from '@medplum/core';
import type { JSX, MouseEvent } from 'react';
import { useContext, useMemo, useState } from 'react';

export interface SliceInputProps extends BaseInputProps {
  readonly slice: SliceDefinitionWithTypes;
  readonly property: ExtendedInternalSchemaElement;
  readonly defaultValue: any[];
  readonly onChange: (newValue: any[]) => void;
  readonly testId?: string;
}

export function SliceInput(props: SliceInputProps): JSX.Element | null {
  const { slice, property } = props;
  const [values, setValues] = useState(props.defaultValue);

  const sliceElements = slice.typeSchema?.elements ?? slice.elements;

  const parentElementsContextValue = useContext(ElementsContext);

  const contextValue: ElementsContextType | undefined = useMemo(() => {
    if (isPopulated(sliceElements)) {
      return buildElementsContext({
        parentContext: parentElementsContextValue,
        elements: sliceElements,
        path: props.path,
        profileUrl: slice.typeSchema?.url,
      });
    }
    return undefined;
  }, [parentElementsContextValue, props.path, slice.typeSchema?.url, sliceElements]);

  function setValuesWrapper(newValues: any[]): void {
    setValues(newValues);
    if (props.onChange) {
      props.onChange(newValues);
    }
  }

  const required = slice.min > 0;

  // this is a bit of a hack targeted at nested extensions; indentation would ideally be controlled elsewhere
  // e.g. USCorePatientProfile -> USCoreEthnicityExtension -> {ombCategory, detailed, text}
  const indentedStack = isEmpty(slice.elements);
  const propertyDisplayName = getPropertyDisplayName(slice.name);
  const showEmptyMessage = props.property.readonly && values.length === 0;
  return maybeWrapWithContext(
    ElementsContext.Provider,
    contextValue,
    <FormSection
      fhirPath={`${property.path}:${slice.name}`}
      data-testid={props.testId}
      readonly={props.property.readonly}
    >
      <FormSectionLabel required={required}>{propertyDisplayName}</FormSectionLabel>
      <FormSectionDescription>{slice.definition}</FormSectionDescription>
      {showEmptyMessage ? (
        <span className="text-muted-foreground">(empty)</span>
      ) : (
        <div
          className={
            indentedStack ? 'mt-2 flex flex-col gap-4 border-l-[3px] border-muted py-2 pl-2' : 'flex flex-col gap-4'
          }
        >
          {values.map((value, valueIndex) => {
            return (
              <div key={`${valueIndex}-${values.length}`} className="flex flex-nowrap gap-2">
                <div className="flex-1" data-testid={props.testId && `${props.testId}-elements-${valueIndex}`}>
                  <ElementDefinitionTypeInput
                    elementDefinitionType={slice.type[0]}
                    name={slice.name}
                    defaultValue={value}
                    onChange={(newValue) => {
                      const newValues = [...values];
                      newValues[valueIndex] = newValue;
                      setValuesWrapper(newValues);
                    }}
                    outcome={props.outcome}
                    min={slice.min}
                    max={slice.max}
                    binding={slice.binding}
                    path={props.path}
                    valuePath={undefined /* `valuePath` not supported in slices */}
                    readOnly={props.property.readonly}
                  />
                </div>
                {!props.property.readonly && values.length > slice.min && (
                  <ArrayRemoveButton
                    propertyDisplayName={propertyDisplayName}
                    testId={props.testId && `${props.testId}-remove-${valueIndex}`}
                    onClick={(e: MouseEvent) => {
                      killEvent(e);
                      const newValues = [...values];
                      newValues.splice(valueIndex, 1);
                      setValuesWrapper(newValues);
                    }}
                  />
                )}
              </div>
            );
          })}
          {!props.property.readonly && values.length < slice.max && (
            <div className="flex flex-nowrap justify-start">
              <ArrayAddButton
                propertyDisplayName={propertyDisplayName}
                onClick={(e: MouseEvent) => {
                  killEvent(e);
                  const newValues = [...values, undefined];
                  setValuesWrapper(newValues);
                }}
                testId={props.testId && `${props.testId}-add`}
              />
            </div>
          )}
        </div>
      )}
      <FormSectionError />
    </FormSection>
  );
}
