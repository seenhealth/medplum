// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceArrayInput/ResourceArrayInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ArrayAddButton } from '@/components/medplum/array-add-button';
import { ArrayRemoveButton } from '@/components/medplum/array-remove-button';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { assignValuesIntoSlices, prepareSlices } from '@/components/medplum/resource-array-input-utils';
import { ResourcePropertyInput } from '@/components/medplum/resource-property-input';
import type { BaseInputProps } from '@/components/medplum/resource-property-input-utils';
import { getValuePath } from '@/components/medplum/resource-property-input-utils';
import { SliceInput } from '@/components/medplum/slice-input';
import { killEvent } from '@/lib/medplum/dom';
import type { ExtendedInternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import { getPathDisplayName } from '@medplum/core';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX, MouseEvent } from 'react';
import { useContext, useEffect, useState } from 'react';

export interface ResourceArrayInputProps extends BaseInputProps {
  readonly property: ExtendedInternalSchemaElement;
  readonly name: string;
  readonly defaultValue?: any[];
  readonly indent?: boolean;
  readonly onChange?: (value: any[]) => void;
  readonly hideNonSliceValues?: boolean;
}

export function ResourceArrayInput(props: ResourceArrayInputProps): JSX.Element | null {
  const { property } = props;
  const medplum = useMedplum();
  const [loading, setLoading] = useState(true);
  const [slices, setSlices] = useState<SliceDefinitionWithTypes[]>([]);
  // props.defaultValue should NOT be used after this; prefer the defaultValue state
  const [defaultValue] = useState<any[]>(() => (Array.isArray(props.defaultValue) ? props.defaultValue : []));
  const [slicedValues, setSlicedValues] = useState<any[][]>(() => [defaultValue]);
  const ctx = useContext(ElementsContext);

  const propertyTypeCode = property.type[0]?.code;
  useEffect(() => {
    prepareSlices({
      medplum,
      property,
    })
      .then((slices) => {
        setSlices(slices);
        const slicedValues = assignValuesIntoSlices(defaultValue, slices, property.slicing, ctx.profileUrl);
        addPlaceholderValues(slicedValues, slices);
        setSlicedValues(slicedValues);
        setLoading(false);
      })
      .catch((reason) => {
        console.error(reason);
        setLoading(false);
      });
  }, [medplum, property, defaultValue, ctx.profileUrl, setSlicedValues]);

  function setValuesWrapper(newValues: any[], sliceIndex: number): void {
    const newSlicedValues = [...slicedValues];
    newSlicedValues[sliceIndex] = newValues;
    setSlicedValues(newSlicedValues);
    if (props.onChange) {
      // Remove any placeholder (i.e. undefined) values before propagating
      const cleaned = newSlicedValues.flat().filter((val) => val !== undefined);
      props.onChange(cleaned);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const nonSliceIndex = slices.length;
  const nonSliceValues = slicedValues[nonSliceIndex];

  // Hide non-sliced values when handling sliced extensions
  const showNonSliceValues = !(props.hideNonSliceValues ?? (propertyTypeCode === 'Extension' && slices.length > 0));
  const propertyDisplayName = getPathDisplayName(property.path);
  const showEmptyMessage = props.property.readonly && slices.length === 0 && defaultValue.length === 0;

  return (
    <div
      className={
        props.indent ? 'mt-2 flex flex-col gap-4 border-l-[3px] border-muted py-2 pl-2' : 'flex flex-col gap-4'
      }
    >
      {showEmptyMessage && <span className="text-muted-foreground">(empty)</span>}
      {slices.map((slice, sliceIndex) => {
        return (
          <SliceInput
            slice={slice}
            key={slice.name}
            path={props.path}
            valuePath={props.valuePath}
            property={property}
            defaultValue={slicedValues[sliceIndex]}
            onChange={(newValue: any[]) => {
              setValuesWrapper(newValue, sliceIndex);
            }}
            testId={`slice-${slice.name}`}
          />
        );
      })}

      {showNonSliceValues &&
        nonSliceValues.map((value, valueIndex) => (
          <div key={`${valueIndex}-${nonSliceValues.length}`} className="flex flex-1 flex-nowrap gap-2">
            <div className="flex-1">
              <ResourcePropertyInput
                arrayElement={true}
                property={props.property}
                name={props.name + '.' + valueIndex}
                path={props.path}
                valuePath={getValuePath(props.path, props.valuePath, valueIndex)}
                defaultValue={value}
                onChange={(newValue: any) => {
                  const newNonSliceValues = [...nonSliceValues];
                  newNonSliceValues[valueIndex] = newValue;
                  setValuesWrapper(newNonSliceValues, nonSliceIndex);
                }}
                defaultPropertyType={undefined}
                outcome={props.outcome}
              />
            </div>
            {!props.property.readonly && (
              <ArrayRemoveButton
                propertyDisplayName={propertyDisplayName}
                testId={`nonsliced-remove-${valueIndex}`}
                onClick={(e: MouseEvent) => {
                  killEvent(e);
                  const newNonSliceValues = [...nonSliceValues];
                  newNonSliceValues.splice(valueIndex, 1);
                  setValuesWrapper(newNonSliceValues, nonSliceIndex);
                }}
              />
            )}
          </div>
        ))}
      {!props.property.readonly && showNonSliceValues && slicedValues.flat().length < property.max && (
        <div className="flex flex-nowrap justify-start">
          <ArrayAddButton
            propertyDisplayName={propertyDisplayName}
            onClick={(e: MouseEvent) => {
              killEvent(e);
              const newNonSliceValues = [...nonSliceValues];
              newNonSliceValues.push(undefined);
              setValuesWrapper(newNonSliceValues, nonSliceIndex);
            }}
            testId="nonsliced-add"
          />
        </div>
      )}
    </div>
  );
}

function addPlaceholderValues(slicedValues: any[][], slices: SliceDefinitionWithTypes[]): void {
  for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
    const slice = slices[sliceIndex];
    const sliceValues = slicedValues[sliceIndex];

    while (sliceValues.length < slice.min) {
      sliceValues.push(undefined);
    }
  }
}
