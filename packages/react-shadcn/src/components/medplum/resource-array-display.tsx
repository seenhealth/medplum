// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceArrayDisplay/ResourceArrayDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DescriptionListEntry } from '@/components/medplum/description-list';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { assignValuesIntoSlices, prepareSlices } from '@/components/medplum/resource-array-input-utils';
import { ResourcePropertyDisplay } from '@/components/medplum/resource-property-display';
import { SliceDisplay } from '@/components/medplum/slice-display';
import type { InternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import { getPathDisplayName, isPopulated } from '@medplum/core';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';

const MAX_ARRAY_SIZE = 50;

export interface ResourceArrayDisplayProps {
  /** The path identifies the element and is expressed as a "."-separated list of ancestor elements, beginning with the name of the resource or extension. */
  readonly path?: string;
  readonly property: InternalSchemaElement;
  readonly propertyType: string;
  readonly values: any[];
  readonly ignoreMissingValues?: boolean;
  readonly link?: boolean;
  readonly includeDescriptionListEntry?: boolean;
}

export function ResourceArrayDisplay(props: ResourceArrayDisplayProps): JSX.Element | null {
  const { property, propertyType } = props;
  const medplum = useMedplum();
  const values = useMemo<any[]>(() => (Array.isArray(props.values) ? props.values : []), [props.values]);
  const [loading, setLoading] = useState(true);
  const [slices, setSlices] = useState<SliceDefinitionWithTypes[]>([]);
  const [slicedValues, setSlicedValues] = useState<any[][]>(() => [values]);
  const [valuesLength, setValuesLength] = useState(0);
  const ctx = useContext(ElementsContext);

  useEffect(() => {
    prepareSlices({
      medplum,
      property,
    })
      .then((slices) => {
        setValuesLength(values.length);
        setSlices(slices);
        const limitedValues = values.slice(0, MAX_ARRAY_SIZE);
        const slicedValues = assignValuesIntoSlices(limitedValues, slices, property.slicing, ctx.profileUrl);
        setSlicedValues(slicedValues);
        setLoading(false);
      })
      .catch((reason) => {
        console.error(reason);
        setLoading(false);
      });
  }, [medplum, property, ctx.profileUrl, setSlicedValues, values]);

  if (loading) {
    return <div>Loading...</div>;
  }

  let nonSliceContent: JSX.Element | undefined;
  const showNonSliceValues = property.type[0]?.code !== 'Extension';
  if (showNonSliceValues) {
    const nonSliceValues = slicedValues[slices.length];
    const nonSliceElements = nonSliceValues.map((value, valueIndex) => (
      <div key={`${valueIndex}-${nonSliceValues.length}`}>
        <ResourcePropertyDisplay
          path={props.path}
          arrayElement={true}
          property={property}
          propertyType={propertyType}
          value={value}
          ignoreMissingValues={props.ignoreMissingValues}
          link={props.link}
        />
      </div>
    ));

    if (props.includeDescriptionListEntry) {
      // Since arrays are responsible for rendering their own DescriptionListEntry, we must find the key
      if (!isPopulated(props.path)) {
        throw new Error('props.path is required when includeDescriptionListEntry is true');
      }
      const key = props.path.split('.').pop() as string;
      nonSliceContent = <DescriptionListEntry term={getPathDisplayName(key)}>{nonSliceElements}</DescriptionListEntry>;
    } else {
      nonSliceContent = <>{nonSliceElements}</>;
    }
  }

  return (
    <>
      {slices.map((slice, sliceIndex) => {
        if (!props.path) {
          throw new Error(`Displaying a resource property with slices of type ${props.propertyType} requires path`);
        }
        let sliceDisplay = (
          <SliceDisplay
            key={slice.name}
            path={props.path}
            slice={slice}
            property={property}
            value={slicedValues[sliceIndex]}
            ignoreMissingValues={props.ignoreMissingValues}
            link={props.link}
          />
        );

        if (props.includeDescriptionListEntry) {
          sliceDisplay = (
            <DescriptionListEntry key={slice.name} term={getPathDisplayName(slice.name)}>
              {sliceDisplay}
            </DescriptionListEntry>
          );
        }
        return sliceDisplay;
      })}

      {nonSliceContent}
      {valuesLength > MAX_ARRAY_SIZE && (
        <div className="flex justify-end">
          <p>... {valuesLength} total values</p>
        </div>
      )}
    </>
  );
}
